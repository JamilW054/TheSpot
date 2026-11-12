-- Marketplace multi-tienda.
--
-- Cada negocio crea una cuenta (profiles.role = 2 'seller'), solicita su tienda
-- (`stores.status = 'pending'`) y el administrador de la plataforma la aprueba.
-- Cada tienda cobra sus propios pedidos (sus cuentas bancarias, su WhatsApp):
-- la plataforma no maneja dinero ni comisiones (por ahora).
--
-- Un checkout de invitado con productos de varias tiendas crea un registro en
-- `checkouts` (lo que ve el cliente) y un `orders` por tienda (lo que gestiona
-- cada tienda).
--
-- Igual que el resto del esquema: el servidor usa service role y filtra por
-- `store_id` en código (`requireSeller()`); las políticas RLS públicas solo
-- cubren el catálogo visible al visitante.

-- ---------------------------------------------------------------------------
-- Tiendas
-- ---------------------------------------------------------------------------

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete set null,
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  logo_url text,
  banner_url text,
  business_type text not null default 'person'
    check (business_type in ('person', 'company')),
  legal_name text,
  tax_id text,
  contact_name text,
  phone text,
  whatsapp text,
  email text,
  notification_email text,
  province text,
  city text,
  address text,
  instagram text,
  facebook text,
  website text,
  sells_categories text[] not null default '{}',
  application_note text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'suspended')),
  status_reason text,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  is_official boolean not null default false,
  trusted boolean not null default false,
  is_featured boolean not null default false,
  free_shipping_min_cents integer,
  payment_methods jsonb not null default
    '{"cashOnDelivery":true,"bankTransfer":true,"cashOnDeliveryNote":"Pagas en efectivo al recibir tu pedido.","bankTransferNote":"Transfiere el total y envía el comprobante por WhatsApp con tu número de pedido."}'::jsonb,
  accepted_policies_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists stores_owner_id_key on public.stores (owner_id)
  where owner_id is not null;
create index if not exists stores_status_idx on public.stores (status);

create table if not exists public.store_status_history (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  status text not null,
  reason text,
  changed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists store_status_history_store_idx
  on public.store_status_history (store_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Tienda oficial (dueña de todo lo que existía antes del marketplace)
-- ---------------------------------------------------------------------------

insert into public.stores (
  slug, name, tagline, status, is_official, trusted, is_featured,
  owner_id, whatsapp, notification_email, free_shipping_min_cents,
  payment_methods, accepted_policies_at, reviewed_at
)
select
  'the-spot',
  'The Spot',
  'Tienda oficial',
  'approved',
  true,
  true,
  true,
  (select p.id from public.profiles p where p.role = 0 order by p.created_at limit 1),
  (select value from public.app_settings where key = 'whatsapp_number'),
  (select value from public.app_settings where key = 'order_notification_email'),
  (select nullif(value, '')::integer from public.app_settings where key = 'free_shipping_min_cents'),
  coalesce(
    (select value::jsonb from public.app_settings where key = 'payment_methods'),
    '{"cashOnDelivery":true,"bankTransfer":true}'::jsonb
  ),
  now(),
  now()
where not exists (select 1 from public.stores where is_official);

-- ---------------------------------------------------------------------------
-- store_id en las tablas que pasan a ser de cada tienda
-- ---------------------------------------------------------------------------

alter table public.products add column if not exists store_id uuid references public.stores (id) on delete cascade;
alter table public.bank_accounts add column if not exists store_id uuid references public.stores (id) on delete cascade;
alter table public.shipping_methods add column if not exists store_id uuid references public.stores (id) on delete cascade;
alter table public.coupons add column if not exists store_id uuid references public.stores (id) on delete cascade;
alter table public.warehouses add column if not exists store_id uuid references public.stores (id) on delete cascade;
alter table public.orders add column if not exists store_id uuid references public.stores (id) on delete set null;

update public.products set store_id = (select id from public.stores where is_official limit 1) where store_id is null;
update public.bank_accounts set store_id = (select id from public.stores where is_official limit 1) where store_id is null;
update public.shipping_methods set store_id = (select id from public.stores where is_official limit 1) where store_id is null;
update public.coupons set store_id = (select id from public.stores where is_official limit 1) where store_id is null;
update public.warehouses set store_id = (select id from public.stores where is_official limit 1) where store_id is null;
update public.orders set store_id = (select id from public.stores where is_official limit 1) where store_id is null;

-- Si no había bodega, la tienda oficial necesita una.
insert into public.warehouses (name, store_id)
select 'The Spot', s.id from public.stores s
where s.is_official and not exists (select 1 from public.warehouses w where w.store_id = s.id);

alter table public.products alter column store_id set not null;
alter table public.bank_accounts alter column store_id set not null;
alter table public.shipping_methods alter column store_id set not null;
alter table public.coupons alter column store_id set not null;
alter table public.warehouses alter column store_id set not null;

create index if not exists products_store_id_idx on public.products (store_id);
create index if not exists bank_accounts_store_id_idx on public.bank_accounts (store_id);
create index if not exists shipping_methods_store_id_idx on public.shipping_methods (store_id);
create index if not exists coupons_store_id_idx on public.coupons (store_id);
create index if not exists warehouses_store_id_idx on public.warehouses (store_id);
create index if not exists orders_store_id_idx on public.orders (store_id, created_at desc);

-- Códigos de cupón: únicos por tienda, no globales.
alter table public.coupons drop constraint if exists coupons_code_key;
create unique index if not exists coupons_store_code_key on public.coupons (store_id, upper(code));

-- Slug de producto: sigue siendo global (la URL /catalogo/[slug] no lleva tienda).

-- ---------------------------------------------------------------------------
-- Moderación de productos
-- ---------------------------------------------------------------------------

alter table public.products
  add column if not exists moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected', 'blocked')),
  add column if not exists moderation_note text,
  add column if not exists moderated_at timestamptz;

create index if not exists products_moderation_idx on public.products (moderation_status)
  where moderation_status <> 'approved';

create table if not exists public.product_reports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  store_id uuid references public.stores (id) on delete cascade,
  reason text not null
    check (reason in ('sexual', 'prohibited', 'counterfeit', 'misleading', 'offensive', 'other')),
  details text,
  reporter_email text,
  reporter_ip text,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolved_by uuid references auth.users (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists product_reports_status_idx on public.product_reports (status, created_at desc);

-- ---------------------------------------------------------------------------
-- Checkouts: compra del cliente que agrupa los pedidos de varias tiendas
-- ---------------------------------------------------------------------------

create table if not exists public.checkouts (
  id uuid primary key default gen_random_uuid(),
  checkout_number text generated always as (upper(left(id::text, 8))) stored,
  contact_email text,
  contact_phone text,
  customer_name text,
  shipping_address jsonb,
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null default 0,
  store_count integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists checkouts_number_idx on public.checkouts (checkout_number);

alter table public.orders
  add column if not exists checkout_id uuid references public.checkouts (id) on delete set null;

create index if not exists orders_checkout_id_idx on public.orders (checkout_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.stores enable row level security;
alter table public.store_status_history enable row level security;
alter table public.product_reports enable row level security;
alter table public.checkouts enable row level security;

-- El visitante solo ve tiendas aprobadas, y solo columnas públicas (GRANT por columna).
drop policy if exists stores_public_select on public.stores;
create policy stores_public_select
  on public.stores for select
  using (status = 'approved');

grant select (
  id, slug, name, tagline, description, logo_url, banner_url, province, city,
  instagram, facebook, website, is_official, is_featured, status, created_at
) on table public.stores to anon, authenticated;

-- Productos: además de activos, la tienda debe estar aprobada y el producto moderado.
drop policy if exists products_public_select on public.products;
create policy products_public_select
  on public.products for select
  using (
    is_active = true
    and deleted_at is null
    and moderation_status = 'approved'
    and exists (
      select 1 from public.stores s
      where s.id = products.store_id and s.status = 'approved'
    )
  );

drop policy if exists product_media_public_select on public.product_media;
create policy product_media_public_select
  on public.product_media for select
  using (exists (select 1 from public.products p where p.id = product_media.product_id));

drop policy if exists product_variants_public_select on public.product_variants;
create policy product_variants_public_select
  on public.product_variants for select
  using (
    is_active = true
    and exists (select 1 from public.products p where p.id = product_variants.product_id)
  );

drop policy if exists product_tags_public_select on public.product_tags;
create policy product_tags_public_select
  on public.product_tags for select
  using (exists (select 1 from public.products p where p.id = product_tags.product_id));

-- Envíos: solo de tiendas aprobadas.
drop policy if exists shipping_methods_public_select on public.shipping_methods;
create policy shipping_methods_public_select
  on public.shipping_methods for select
  using (
    is_active = true
    and deleted_at is null
    and exists (
      select 1 from public.stores s
      where s.id = shipping_methods.store_id and s.status = 'approved'
    )
  );

grant all on table public.stores, public.store_status_history, public.product_reports,
  public.checkouts to service_role;

-- ---------------------------------------------------------------------------
-- Ajustes de plataforma
-- ---------------------------------------------------------------------------

insert into public.app_settings (key, value) values
  ('marketplace_blocked_words',
   'sexual,sexo,porno,porn,xxx,erótico,erotico,erótica,erotica,consolador,dildo,vibrador,lencería erótica,juguete sexual,juguetes sexuales,viagra,cialis,arma,pistola,revólver,revolver,munición,municion,marihuana,cannabis,cbd,vape thc,cocaína,cocaina,réplica,replica,imitación,imitacion,clon 1:1,falsificado')
on conflict (key) do nothing;
