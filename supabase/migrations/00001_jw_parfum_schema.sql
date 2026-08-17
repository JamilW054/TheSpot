-- JW PARFUM — esquema inicial.
-- Reemplaza por completo el historial de migraciones heredado de Buxxep (desactualizado
-- respecto al código real). Esta es la única fuente de verdad del esquema de datos.
-- Ver docs/00-refactor-status.md para el contexto del refactor.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Perfiles (solo administradores; no hay registro público de clientes)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  full_name text,
  -- 0 = admin, 1 = client (vestigial: sin cuentas de cliente, siempre 0 en la práctica).
  role smallint not null default 1,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catálogo: marcas, categorías, tamaños (ml), productos, variantes, media, tags
-- ---------------------------------------------------------------------------

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_url text,
  website_url text,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Presets reutilizables de "talla" (aquí: tamaños en ml) o color, asignables a productos.
create table public.size_presets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'size' check (kind in ('size', 'color')),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.size_preset_items (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid not null references public.size_presets (id) on delete cascade,
  label text not null,
  swatch_hex text,
  sort_order integer not null default 0
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  parent_id uuid references public.categories (id) on delete set null,
  image_url text,
  size_preset_id uuid references public.size_presets (id) on delete set null,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  brand_id uuid references public.brands (id) on delete set null,
  base_price_cents integer not null default 0,
  original_price_cents integer,
  cost_cents integer not null default 0,
  is_active boolean not null default true,
  in_stock boolean not null default true,
  -- Sin sistema de reseñas (requeriría cuentas de cliente): columnas conservadas
  -- por compatibilidad con el select del catálogo, siempre en su valor por defecto.
  rating_avg numeric(3, 2),
  review_count integer not null default 0,
  meta_title text,
  meta_description text,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  media_type text not null default 'image',
  alt_text text,
  is_cover boolean not null default false,
  sort_order integer not null default 0
);

-- Una fila por tamaño vendible (ej. 30ml/50ml/100ml). El atributo se guarda como
-- `attributes.size` (string) por compatibilidad con el código existente
-- (variantKey/sizesFromVariants) — para perfumes contiene el tamaño en ml, no una talla.
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text unique,
  price_cents integer,
  attributes jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table public.product_tags (
  product_id uuid not null references public.products (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (product_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- Inventario: una sola tienda/bodega fija (sin UI de "almacenes")
-- ---------------------------------------------------------------------------

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  country_code text not null default 'DO',
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  warehouse_id uuid not null references public.warehouses (id) on delete cascade,
  quantity integer not null default 0,
  reserved integer not null default 0,
  deleted_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (variant_id, warehouse_id)
);

-- ---------------------------------------------------------------------------
-- Marketing: cupones, métodos de envío
-- ---------------------------------------------------------------------------

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value integer not null,
  min_order_cents integer,
  max_uses integer,
  uses_count integer not null default 0,
  max_uses_per_user integer,
  is_active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shipping_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents integer not null default 0,
  min_days integer,
  max_days integer,
  is_active boolean not null default true,
  country_code text,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pedidos (checkout de invitado: user_id puede ser NULL). Sin pasarela de pago:
-- payment_status solo indica si el admin marcó el pedido como cobrado.
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid')),
  contact_email text,
  shipping_address jsonb,
  notes text,
  coupon_id uuid references public.coupons (id) on delete set null,
  coupon_discount_cents integer not null default 0,
  shipping_method_id uuid references public.shipping_methods (id) on delete set null,
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  tax_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null default 0,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  quantity integer not null default 1,
  unit_price_cents integer not null default 0,
  total_price_cents integer not null default 0,
  size text,
  color text,
  product_snapshot jsonb,
  created_at timestamptz not null default now()
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  changed_by uuid references auth.users (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Configuración y auditoría de correo
-- ---------------------------------------------------------------------------

create table public.app_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

create table public.email_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  email_type text not null,
  created_at timestamptz not null default now()
);

create unique index email_logs_order_receipt_unique
  on public.email_logs (order_id)
  where email_type = 'receipt';

-- ---------------------------------------------------------------------------
-- Índices de consulta frecuente
-- ---------------------------------------------------------------------------

create index products_category_id_idx on public.products (category_id);
create index products_brand_id_idx on public.products (brand_id);
create index product_media_product_id_idx on public.product_media (product_id);
create index product_variants_product_id_idx on public.product_variants (product_id);
create index inventory_variant_id_idx on public.inventory (variant_id);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_variant_id_idx on public.order_items (variant_id);
create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);
create index categories_parent_id_idx on public.categories (parent_id);
