-- =============================================================================
-- Buxxep — Anulación de pagos a socios (borrado lógico)
-- =============================================================================
-- Antes el libro era estrictamente append-only: un pago mal registrado solo se
-- podía corregir con un asiento negativo, y las dos filas quedaban a la vista.
-- En la práctica eso ensucia el historial (un error de tecleo deja dos líneas
-- para siempre), así que se sustituye por una ANULACIÓN:
--
--   - El admin "borra" un pago → se marca `voided_at` / `voided_by`.
--   - El pago desaparece del historial y deja de contar como pagado.
--   - La fila NO se borra: queda quién lo anuló y cuándo. Un libro contable en
--     el que un importe puede evaporarse sin rastro no es auditable.
--
-- Lo que se sigue prohibiendo (trigger):
--   - DELETE físico.
--   - Editar importe, fecha, mes, referencia o autor de un pago existente.
--   - Reanular un pago ya anulado.
-- Es decir: un pago es inmutable en su contenido; lo único que puede cambiar es
-- su vigencia.
-- =============================================================================

ALTER TABLE public.partner_payments
  ADD COLUMN IF NOT EXISTS voided_at     timestamptz,
  ADD COLUMN IF NOT EXISTS voided_by     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS voided_reason text;

COMMENT ON COLUMN public.partner_payments.voided_at IS
  'Si no es NULL, el pago está anulado: no cuenta como pagado ni se muestra en el historial. La fila se conserva para auditoría.';

-- Los listados y la vista filtran por `voided_at IS NULL` constantemente.
CREATE INDEX IF NOT EXISTS partner_payments_active_idx
  ON public.partner_payments (partner_id, period_month DESC)
  WHERE voided_at IS NULL;

-- La referencia de un pago anulado deja de "ocupar sitio": si el admin anuló un
-- pago con la referencia de una transferencia, debe poder volver a registrarla
-- bien con esa misma referencia real.
DROP INDEX IF EXISTS public.partner_payments_reference_unique_idx;
CREATE UNIQUE INDEX partner_payments_reference_unique_idx
  ON public.partner_payments (upper(btrim(reference)))
  WHERE reference IS NOT NULL AND voided_at IS NULL;

-- ---------------------------------------------------------------------------
-- Trigger: inmutable en contenido, anulable en vigencia
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.partner_payments_append_only()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION
      'Un pago no se borra de la base de datos: anúlalo (voided_at) para que deje de contar.'
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF OLD.voided_at IS NOT NULL THEN
    RAISE EXCEPTION 'Este pago ya estaba anulado.'
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF NEW.voided_at IS NULL THEN
    RAISE EXCEPTION
      'Un pago no se edita: lo único que puede cambiar es su anulación (voided_at).'
      USING ERRCODE = 'restrict_violation';
  END IF;

  -- Anulación válida, pero nada más puede cambiar en la misma operación: si no,
  -- "anular" se convertiría en una puerta trasera para reescribir el importe.
  IF NEW.partner_id   IS DISTINCT FROM OLD.partner_id
     OR NEW.period_month IS DISTINCT FROM OLD.period_month
     OR NEW.amount_cents IS DISTINCT FROM OLD.amount_cents
     OR NEW.payment_date IS DISTINCT FROM OLD.payment_date
     OR NEW.reference    IS DISTINCT FROM OLD.reference
     OR NEW.created_by   IS DISTINCT FROM OLD.created_by
     OR NEW.created_at   IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION
      'Al anular un pago no se puede modificar ningún otro campo.'
      USING ERRCODE = 'restrict_violation';
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- La vista ignora los pagos anulados
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.partner_monthly_statements
WITH (security_invoker = true) AS
WITH months AS (
  SELECT month FROM public.admin_monthly_commissions
  UNION
  SELECT period_month AS month FROM public.partner_payments WHERE voided_at IS NULL
  UNION
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
      AND pp.voided_at IS NULL   -- ← un pago anulado no cuenta como pagado
  ) pay ON true
  WHERE p.deleted_at IS NULL
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

NOTIFY pgrst, 'reload schema';
