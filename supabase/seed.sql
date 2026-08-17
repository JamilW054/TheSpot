-- JW PARFUM — datos demo para desarrollo local (`pnpm db:reset`).
-- No se ejecuta contra el proyecto remoto salvo que se corra explícitamente.

-- Almacén único de la tienda.
insert into public.warehouses (id, name, country_code, is_active)
values ('00000000-0000-0000-0000-000000000001', 'Principal', 'DO', true);

-- Preset de tamaños (ml), reutilizado por los productos demo.
insert into public.size_presets (id, name, kind)
values ('00000000-0000-0000-0000-000000000010', 'Tamaños', 'size');

insert into public.size_preset_items (preset_id, label, sort_order)
values
  ('00000000-0000-0000-0000-000000000010', '30ml', 0),
  ('00000000-0000-0000-0000-000000000010', '50ml', 1),
  ('00000000-0000-0000-0000-000000000010', '100ml', 2);

-- Marcas demo.
insert into public.brands (id, slug, name, is_active)
values
  ('00000000-0000-0000-0000-000000000020', 'jw-signature', 'JW Signature', true),
  ('00000000-0000-0000-0000-000000000021', 'maison-blanc', 'Maison Blanc', true);

-- Categorías demo.
insert into public.categories (id, slug, name, size_preset_id, sort_order)
values
  ('00000000-0000-0000-0000-000000000030', 'para-el', 'Para Él', '00000000-0000-0000-0000-000000000010', 0),
  ('00000000-0000-0000-0000-000000000031', 'para-ella', 'Para Ella', '00000000-0000-0000-0000-000000000010', 1),
  ('00000000-0000-0000-0000-000000000032', 'unisex', 'Unisex', '00000000-0000-0000-0000-000000000010', 2);

-- Productos demo, cada uno con variantes 50ml/100ml e inventario inicial.
insert into public.products (id, slug, name, description, category_id, brand_id, base_price_cents, cost_cents, is_active)
values
  ('00000000-0000-0000-0000-000000000040', 'noir-intense', 'Noir Intense', 'Fragancia amaderada y especiada, ideal para la noche.', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000020', 285000, 120000, true),
  ('00000000-0000-0000-0000-000000000041', 'fleur-blanche', 'Fleur Blanche', 'Notas florales y cítricas, fresca y luminosa.', '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000021', 265000, 110000, true),
  ('00000000-0000-0000-0000-000000000042', 'essence-neutre', 'Essence Neutre', 'Perfume unisex, almizclado y minimalista.', '00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000020', 245000, 100000, true);

insert into public.product_media (product_id, url, is_cover, sort_order)
values
  ('00000000-0000-0000-0000-000000000040', 'https://placehold.co/600x800?text=Noir+Intense', true, 0),
  ('00000000-0000-0000-0000-000000000041', 'https://placehold.co/600x800?text=Fleur+Blanche', true, 0),
  ('00000000-0000-0000-0000-000000000042', 'https://placehold.co/600x800?text=Essence+Neutre', true, 0);

insert into public.product_variants (id, product_id, sku, price_cents, attributes, sort_order)
values
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000040', 'NOIR-INTENSE-50ML', 285000, '{"size": "50ml"}', 0),
  ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000040', 'NOIR-INTENSE-100ML', 385000, '{"size": "100ml"}', 1),
  ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000041', 'FLEUR-BLANCHE-50ML', 265000, '{"size": "50ml"}', 0),
  ('00000000-0000-0000-0000-000000000053', '00000000-0000-0000-0000-000000000041', 'FLEUR-BLANCHE-100ML', 355000, '{"size": "100ml"}', 1),
  ('00000000-0000-0000-0000-000000000054', '00000000-0000-0000-0000-000000000042', 'ESSENCE-NEUTRE-50ML', 245000, '{"size": "50ml"}', 0),
  ('00000000-0000-0000-0000-000000000055', '00000000-0000-0000-0000-000000000042', 'ESSENCE-NEUTRE-100ML', 335000, '{"size": "100ml"}', 1);

insert into public.inventory (variant_id, warehouse_id, quantity)
select id, '00000000-0000-0000-0000-000000000001', 15
from public.product_variants;

-- Método de envío demo.
insert into public.shipping_methods (name, description, price_cents, min_days, max_days, is_active, country_code)
values ('Entrega estándar', 'Envío a domicilio en Santo Domingo y alrededores', 25000, 1, 3, true, 'DO');

-- Correo de aviso de pedidos y número de WhatsApp por defecto.
insert into public.app_settings (key, value)
values
  ('order_notification_email', 'jamilwilliams054@gmail.com'),
  ('whatsapp_number', '18097612875');
