-- JW — Row Level Security.
--
-- Patrón de la app: casi todo el acceso pasa por Server Actions/rutas usando el
-- cliente de service role (bypassa RLS), protegido en el código por
-- `requireAdmin()` (ver src/lib/auth/require-admin.ts). Por eso la mayoría de
-- las tablas NO necesitan políticas públicas: pedidos, cupones, inventario,
-- configuración y el catálogo en modo admin se leen/escriben siempre con
-- service role, nunca directamente desde el navegador.
--
-- Las únicas tablas que el navegador consulta directamente con la clave anon
-- (catálogo público, sin login) son: brands, categories, products,
-- product_media, product_variants, tags, product_tags, size_presets,
-- size_preset_items, shipping_methods. Se habilita RLS en todas las tablas por
-- higiene, pero solo estas reciben una política de lectura pública.

alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.size_presets enable row level security;
alter table public.size_preset_items enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.product_variants enable row level security;
alter table public.tags enable row level security;
alter table public.product_tags enable row level security;
alter table public.warehouses enable row level security;
alter table public.inventory enable row level security;
alter table public.coupons enable row level security;
alter table public.shipping_methods enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.app_settings enable row level security;
alter table public.email_logs enable row level security;

-- profiles: cada usuario (solo administradores en la práctica) puede leer su propia fila.
create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = id);

-- Catálogo público de solo lectura (visitantes anónimos y admin autenticado).
create policy brands_public_select
  on public.brands for select
  using (is_active = true and deleted_at is null);

create policy categories_public_select
  on public.categories for select
  using (deleted_at is null);

create policy size_presets_public_select
  on public.size_presets for select
  using (deleted_at is null);

create policy size_preset_items_public_select
  on public.size_preset_items for select
  using (true);

create policy products_public_select
  on public.products for select
  using (is_active = true and deleted_at is null);

create policy product_media_public_select
  on public.product_media for select
  using (true);

create policy product_variants_public_select
  on public.product_variants for select
  using (is_active = true);

create policy tags_public_select
  on public.tags for select
  using (true);

create policy product_tags_public_select
  on public.product_tags for select
  using (true);

create policy shipping_methods_public_select
  on public.shipping_methods for select
  using (is_active = true and deleted_at is null);

-- El resto (warehouses, inventory, coupons, orders, order_items,
-- order_status_history, app_settings, email_logs) queda sin políticas: con RLS
-- activo y ninguna política, solo el service role puede leer/escribir — que es
-- exactamente como el código ya los usa (checkout, admin, /estado-pedido).
