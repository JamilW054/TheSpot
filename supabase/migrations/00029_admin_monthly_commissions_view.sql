-- 00029_admin_monthly_commissions_view.sql
-- Vista de comisiones mensuales para /admin: AZUL (5% de lo procesado),
-- G3DEON (12% de la ganancia bruta) y ganancia neta de Buxxep.
--
-- El cálculo vivía en TypeScript (admin-metrics.ts) contra columnas que no
-- existen en el esquema real (`orders.paid_at`, `order_items.product_id`), por
-- lo que la consulta fallaba y el dashboard mostraba RD$0.00. Aquí se calcula
-- sobre las columnas reales:
--   - fecha de pago: `payment_transactions.paid_at` (fallback `orders.updated_at`)
--   - coste: `order_items.variant_id` → `product_variants.product_id` → `products.cost_cents`
--
-- Fórmula (misma que lib/pricing.ts):
--   comisión AZUL   = ingreso procesado × %azul
--   ganancia bruta  = ingreso de líneas − coste de mercancía
--   comisión G3DEON = max(0, ganancia bruta) × %g3deon
--   ganancia neta   = ganancia bruta − comisión AZUL − comisión G3DEON

create or replace view public.admin_monthly_commissions
with (security_invoker = true) as
with rates as (
  select
    coalesce(
      (select value::numeric from public.app_settings
        where key = 'azul_commission_percent'), 5
    ) as azul_pct,
    coalesce(
      (select value::numeric from public.app_settings
        where key = 'g3deon_commission_percent'), 12
    ) as g3deon_pct
),
paid_orders as (
  select
    o.id,
    o.total_cents,
    date_trunc('month', coalesce(tx.paid_at, o.updated_at)) as month
  from public.orders o
  left join lateral (
    select t.paid_at
    from public.payment_transactions t
    where t.order_id = o.id and t.paid_at is not null
    order by t.paid_at desc
    limit 1
  ) tx on true
  where o.payment_type = 'AZUL_PAYMENT'
    and o.payment_status = 'paid'
),
lines as (
  select
    po.month,
    sum(oi.unit_price_cents * oi.quantity)                        as items_revenue_cents,
    sum(coalesce(p.cost_cents, 0) * oi.quantity)                  as items_cost_cents,
    sum(
      case when coalesce(p.cost_cents, 0) > 0
        then oi.unit_price_cents * oi.quantity else 0 end
    )                                                             as revenue_with_cost_cents
  from paid_orders po
  join public.order_items oi on oi.order_id = po.id
  left join public.product_variants v on v.id = oi.variant_id
  left join public.products p on p.id = v.product_id
  group by po.month
),
orders_agg as (
  select
    month,
    count(*)          as azul_orders_count,
    sum(total_cents)  as azul_revenue_cents
  from paid_orders
  group by month
)
select
  oa.month::date                                        as month,
  oa.azul_orders_count,
  oa.azul_revenue_cents::bigint                         as azul_revenue_cents,
  r.azul_pct,
  round(oa.azul_revenue_cents * r.azul_pct / 100)::bigint as azul_commission_cents,
  coalesce(l.items_revenue_cents, 0)::bigint            as items_revenue_cents,
  coalesce(l.items_cost_cents, 0)::bigint               as items_cost_cents,
  coalesce(l.revenue_with_cost_cents, 0)::bigint        as revenue_with_cost_cents,
  (coalesce(l.items_revenue_cents, 0) - coalesce(l.items_cost_cents, 0))::bigint
                                                        as gross_profit_cents,
  r.g3deon_pct,
  round(
    greatest(
      0,
      coalesce(l.items_revenue_cents, 0) - coalesce(l.items_cost_cents, 0)
    ) * r.g3deon_pct / 100
  )::bigint                                             as g3deon_commission_cents,
  (
    (coalesce(l.items_revenue_cents, 0) - coalesce(l.items_cost_cents, 0))
    - round(oa.azul_revenue_cents * r.azul_pct / 100)
    - round(
        greatest(
          0,
          coalesce(l.items_revenue_cents, 0) - coalesce(l.items_cost_cents, 0)
        ) * r.g3deon_pct / 100
      )
  )::bigint                                             as net_profit_cents
from orders_agg oa
cross join rates r
left join lines l on l.month = oa.month
order by oa.month desc;

comment on view public.admin_monthly_commissions is
  'Comisiones por mes calendario: AZUL sobre lo procesado, G3DEON sobre la ganancia bruta, y ganancia neta de Buxxep. Los porcentajes salen de app_settings.';

notify pgrst, 'reload schema';
