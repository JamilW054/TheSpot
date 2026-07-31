-- =============================================================================
-- Buxxep — Estado de cuenta mensual por socio (partner_monthly_statements)
-- =============================================================================
-- Todo lo derivado vive aquí; nada de esto se guarda en tablas:
--
--   deuda del mes   = según la estrategia del socio (porcentaje o monto fijo)
--   pagado del mes  = suma de partner_payments imputados a ese mes
--   balance         = deuda − pagado
--   último pago     = max(payment_date) de ese mes
--   estado          = pendiente / parcial / pagado / sobrepagado / sin deuda
--
-- Las bases del porcentaje salen de `admin_monthly_commissions` (migración
-- 00029) y se miden ANTES del reparto a socios, para que la deuda de un socio
-- nunca entre en su propia base:
--
--   revenue      = azul_revenue_cents        (procesado por la pasarela)
--   gross_profit = gross_profit_cents        (ingreso de líneas − coste)
--   net_profit   = gross_profit − azul_commission_cents
--
-- Una fila por (socio × mes) para todo mes dentro de la ventana de devengo del
-- socio en el que haya habido ventas o pagos, más siempre el mes en curso — así
-- un socio de monto fijo aparece con su deuda aunque el mes no tenga ni una
-- venta, y el mes actual nunca falta en el dashboard.
-- =============================================================================

CREATE OR REPLACE VIEW public.partner_monthly_statements
WITH (security_invoker = true) AS
WITH months AS (
  SELECT month FROM public.admin_monthly_commissions
  UNION
  SELECT period_month AS month FROM public.partner_payments
  UNION
  -- Mes en curso en hora dominicana (UTC-4): el dashboard siempre debe tener fila.
  SELECT date_trunc(
           'month',
           (now() AT TIME ZONE 'America/Santo_Domingo')
         )::date
),
bases AS (
  SELECT
    m.month,
    COALESCE(c.azul_revenue_cents, 0)::bigint    AS revenue_cents,
    COALESCE(c.gross_profit_cents, 0)::bigint    AS gross_profit_cents,
    (COALESCE(c.gross_profit_cents, 0) - COALESCE(c.azul_commission_cents, 0))::bigint
                                                 AS net_profit_cents
  FROM months m
  LEFT JOIN public.admin_monthly_commissions c ON c.month = m.month
),
statements AS (
  SELECT
    p.id                                          AS partner_id,
    p.name                                        AS partner_name,
    p.payment_type,
    p.percentage_rate,
    p.percentage_base,
    p.fixed_amount_cents,
    p.active,
    b.month,
    b.revenue_cents                               AS base_revenue_cents,
    b.gross_profit_cents                          AS base_gross_profit_cents,
    b.net_profit_cents                            AS base_net_profit_cents,

    -- Deuda devengada del mes según la estrategia del socio.
    -- Nunca negativa: un mes en pérdidas no genera deuda a favor de la empresa
    -- (misma regla que lib/pricing.ts — `max(0, …)` en cada comisión).
    CASE p.payment_type
      WHEN 'fixed' THEN COALESCE(p.fixed_amount_cents, 0)
      WHEN 'percentage' THEN GREATEST(0, round(
        CASE p.percentage_base
          WHEN 'revenue'    THEN b.revenue_cents
          WHEN 'net_profit' THEN b.net_profit_cents
          ELSE                   b.gross_profit_cents
        END * COALESCE(p.percentage_rate, 0) / 100
      ))
      ELSE 0
    END::bigint                                   AS due_cents,

    COALESCE(pay.paid_cents, 0)::bigint           AS paid_cents,
    pay.last_payment_date,
    COALESCE(pay.payments_count, 0)::int          AS payments_count
  FROM public.partners p
  CROSS JOIN bases b
  LEFT JOIN LATERAL (
    SELECT
      sum(pp.amount_cents)  AS paid_cents,
      max(pp.payment_date)  AS last_payment_date,
      count(*)              AS payments_count
    FROM public.partner_payments pp
    WHERE pp.partner_id = p.id
      AND pp.period_month = b.month
  ) pay ON true
  WHERE p.deleted_at IS NULL
    -- Ventana de devengo: desde `starts_on` (o el alta) hasta `ends_on`.
    AND b.month >= date_trunc('month', COALESCE(p.starts_on, p.created_at::date))::date
    AND (p.ends_on IS NULL OR b.month <= date_trunc('month', p.ends_on)::date)
)
SELECT
  s.*,
  (s.due_cents - s.paid_cents)::bigint AS balance_cents,
  CASE
    WHEN s.due_cents <= 0 AND s.paid_cents = 0 THEN 'no_due'
    WHEN s.paid_cents <= 0                     THEN 'pending'
    WHEN s.paid_cents > s.due_cents            THEN 'overpaid'
    WHEN s.paid_cents = s.due_cents            THEN 'paid'
    ELSE                                            'partial'
  END AS status
FROM statements s
ORDER BY s.month DESC, s.partner_name ASC;

COMMENT ON VIEW public.partner_monthly_statements IS
  'Estado de cuenta mensual por socio: deuda devengada, pagado, balance y estado. Todo calculado — nada se persiste. Bases del porcentaje tomadas de admin_monthly_commissions.';

NOTIFY pgrst, 'reload schema';
