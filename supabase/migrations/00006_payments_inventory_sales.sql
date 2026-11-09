-- Métodos de pago offline (contra entrega / transferencia), cuentas bancarias
-- administrables, costo histórico por línea (reportes de ganancia), categorías
-- "próximamente" configurables y bucket de imágenes de producto.

-- ---------------------------------------------------------------------------
-- Cuentas bancarias para transferencia (administrables en /admin/pagos)
-- ---------------------------------------------------------------------------

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  bank_name text not null,
  account_type text not null default 'Ahorros',
  account_number text not null default '',
  holder_name text not null default '',
  holder_document text,
  currency text not null default 'DOP',
  instructions text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bank_accounts enable row level security;
-- Sin políticas: solo service_role (servidor) lee/escribe. El checkout las
-- obtiene desde un Server Component y solo expone las activas.

-- Banreservas y Popular precargadas como inactivas: el admin completa el
-- número de cuenta y titular y las activa desde el portal.
insert into public.bank_accounts (bank_name, account_type, sort_order, is_active)
select v.bank_name, 'Ahorros', v.sort_order, false
from (values ('Banreservas', 0), ('Banco Popular', 1)) as v(bank_name, sort_order)
where not exists (select 1 from public.bank_accounts);

-- ---------------------------------------------------------------------------
-- Pedidos: método de pago y cuenta elegida
-- ---------------------------------------------------------------------------

alter table public.orders
  add column if not exists payment_method text not null default 'cash_on_delivery'
    check (payment_method in ('cash_on_delivery', 'bank_transfer')),
  add column if not exists bank_account_id uuid references public.bank_accounts (id) on delete set null,
  -- Copia de la cuenta al momento del pedido (si el admin la edita o borra
  -- después, el pedido conserva lo que vio el cliente).
  add column if not exists bank_account_snapshot jsonb,
  add column if not exists admin_notes text;

create index if not exists orders_payment_method_idx on public.orders (payment_method);

-- Costo unitario congelado al vender, para calcular ganancia real.
alter table public.order_items
  add column if not exists unit_cost_cents integer not null default 0;

-- Backfill de pedidos existentes con el costo actual del producto.
update public.order_items oi
set unit_cost_cents = coalesce(p.cost_cents, 0)
from public.product_variants v
join public.products p on p.id = v.product_id
where oi.variant_id = v.id and oi.unit_cost_cents = 0;

-- ---------------------------------------------------------------------------
-- Categorías "próximamente" (antes fijas en código)
-- ---------------------------------------------------------------------------

alter table public.categories
  add column if not exists coming_soon boolean not null default false;

update public.categories set coming_soon = true
where slug in ('belleza', 'relojes', 'gorras') and coming_soon = false
  and not exists (select 1 from public.app_settings where key = 'coming_soon_migrated');

insert into public.app_settings (key, value)
values ('coming_soon_migrated', 'true')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Ajustes por defecto
-- ---------------------------------------------------------------------------

insert into public.app_settings (key, value) values
  ('payment_methods', '{"cashOnDelivery":true,"bankTransfer":true,"cashOnDeliveryNote":"Pagas en efectivo al recibir tu pedido.","bankTransferNote":"Transfiere el total y envíanos el comprobante por WhatsApp con tu número de pedido."}'),
  ('free_shipping_min_cents', '350000')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Storage: imágenes de producto (fallback cuando R2 no está configurado)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;
