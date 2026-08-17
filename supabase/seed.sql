-- JW — datos demo para desarrollo local (`pnpm db:reset`).

insert into public.warehouses (id, name, country_code, is_active)
values ('00000000-0000-0000-0000-000000000001', 'Principal', 'DO', true);

-- Presets por tipo de producto.
insert into public.size_presets (id, name, kind)
values
  ('00000000-0000-0000-0000-000000000010', 'Perfume (ml)', 'size'),
  ('00000000-0000-0000-0000-000000000011', 'Tenis (EU)', 'size'),
  ('00000000-0000-0000-0000-000000000012', 'Gorras', 'size'),
  ('00000000-0000-0000-0000-000000000013', 'Único', 'size'),
  ('00000000-0000-0000-0000-000000000014', 'Colores JW', 'color');

insert into public.size_preset_items (preset_id, label, sort_order, swatch_hex)
values
  ('00000000-0000-0000-0000-000000000010', '30ml', 0, null),
  ('00000000-0000-0000-0000-000000000010', '50ml', 1, null),
  ('00000000-0000-0000-0000-000000000010', '100ml', 2, null),
  ('00000000-0000-0000-0000-000000000011', '38', 0, null),
  ('00000000-0000-0000-0000-000000000011', '39', 1, null),
  ('00000000-0000-0000-0000-000000000011', '40', 2, null),
  ('00000000-0000-0000-0000-000000000011', '41', 3, null),
  ('00000000-0000-0000-0000-000000000011', '42', 4, null),
  ('00000000-0000-0000-0000-000000000011', '43', 5, null),
  ('00000000-0000-0000-0000-000000000011', '44', 6, null),
  ('00000000-0000-0000-0000-000000000012', 'Unitalla', 0, null),
  ('00000000-0000-0000-0000-000000000013', 'Único', 0, null),
  ('00000000-0000-0000-0000-000000000014', 'Negro', 0, '#111111'),
  ('00000000-0000-0000-0000-000000000014', 'Blanco', 1, '#ffffff'),
  ('00000000-0000-0000-0000-000000000014', 'Rojo', 2, '#dc2626');

insert into public.brands (id, slug, name, is_active)
values
  ('00000000-0000-0000-0000-000000000020', 'jw', 'JW', true),
  ('00000000-0000-0000-0000-000000000021', 'atelier', 'Atelier', true);

insert into public.categories (id, slug, name, size_preset_id, sort_order)
values
  ('00000000-0000-0000-0000-000000000030', 'belleza', 'Belleza', '00000000-0000-0000-0000-000000000013', 0),
  ('00000000-0000-0000-0000-000000000031', 'relojes', 'Relojes', '00000000-0000-0000-0000-000000000013', 1),
  ('00000000-0000-0000-0000-000000000032', 'perfumes', 'Perfumes', '00000000-0000-0000-0000-000000000010', 2),
  ('00000000-0000-0000-0000-000000000033', 'gorras', 'Gorras', '00000000-0000-0000-0000-000000000012', 3),
  ('00000000-0000-0000-0000-000000000034', 'tenis', 'Tenis', '00000000-0000-0000-0000-000000000011', 4);

insert into public.products (id, slug, name, description, category_id, brand_id, base_price_cents, cost_cents, is_active)
values
  ('00000000-0000-0000-0000-000000000040', 'serum-glow', 'Serum Glow', 'Sérum hidratante de uso diario para un cutis luminoso.', '00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000020', 185000, 70000, true),
  ('00000000-0000-0000-0000-000000000041', 'chrono-noir', 'Chrono Noir', 'Reloj de pulsera con caja negra y correa de cuero.', '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000021', 450000, 180000, true),
  ('00000000-0000-0000-0000-000000000042', 'noir-intense', 'Noir Intense', 'Fragancia amaderada y especiada, ideal para la noche.', '00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000020', 285000, 120000, true),
  ('00000000-0000-0000-0000-000000000043', 'cap-classic', 'Cap Classic', 'Gorra de algodón con bordado JW. Unitalla ajustable.', '00000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000020', 125000, 45000, true),
  ('00000000-0000-0000-0000-000000000044', 'runner-one', 'Runner One', 'Tenis urbanos de uso diario, suela ligera.', '00000000-0000-0000-0000-000000000034', '00000000-0000-0000-0000-000000000021', 395000, 160000, true);

insert into public.product_media (product_id, url, is_cover, sort_order)
values
  ('00000000-0000-0000-0000-000000000040', 'https://placehold.co/600x800/ffffff/dc2626?text=Serum+Glow', true, 0),
  ('00000000-0000-0000-0000-000000000041', 'https://placehold.co/600x800/111111/ffffff?text=Chrono+Noir', true, 0),
  ('00000000-0000-0000-0000-000000000042', 'https://placehold.co/600x800/dc2626/ffffff?text=Noir+Intense', true, 0),
  ('00000000-0000-0000-0000-000000000043', 'https://placehold.co/600x800/ffffff/111111?text=Cap+Classic', true, 0),
  ('00000000-0000-0000-0000-000000000044', 'https://placehold.co/600x800/111111/dc2626?text=Runner+One', true, 0);

insert into public.product_variants (id, product_id, sku, price_cents, attributes, sort_order)
values
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000040', 'SERUM-GLOW', 185000, '{"size": "Único"}', 0),
  ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000041', 'CHRONO-NOIR', 450000, '{"size": "Único"}', 0),
  ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000042', 'NOIR-INTENSE-50ML', 285000, '{"size": "50ml"}', 0),
  ('00000000-0000-0000-0000-000000000053', '00000000-0000-0000-0000-000000000042', 'NOIR-INTENSE-100ML', 385000, '{"size": "100ml"}', 1),
  ('00000000-0000-0000-0000-000000000054', '00000000-0000-0000-0000-000000000043', 'CAP-CLASSIC-NEGRO', 125000, '{"size": "Unitalla", "color": "Negro"}', 0),
  ('00000000-0000-0000-0000-000000000055', '00000000-0000-0000-0000-000000000043', 'CAP-CLASSIC-BLANCO', 125000, '{"size": "Unitalla", "color": "Blanco"}', 1),
  ('00000000-0000-0000-0000-000000000056', '00000000-0000-0000-0000-000000000043', 'CAP-CLASSIC-ROJO', 125000, '{"size": "Unitalla", "color": "Rojo"}', 2),
  ('00000000-0000-0000-0000-000000000057', '00000000-0000-0000-0000-000000000044', 'RUNNER-ONE-40', 395000, '{"size": "40"}', 0),
  ('00000000-0000-0000-0000-000000000058', '00000000-0000-0000-0000-000000000044', 'RUNNER-ONE-41', 395000, '{"size": "41"}', 1),
  ('00000000-0000-0000-0000-000000000059', '00000000-0000-0000-0000-000000000044', 'RUNNER-ONE-42', 395000, '{"size": "42"}', 2),
  ('00000000-0000-0000-0000-00000000005a', '00000000-0000-0000-0000-000000000044', 'RUNNER-ONE-43', 395000, '{"size": "43"}', 3);

insert into public.inventory (variant_id, warehouse_id, quantity)
select id, '00000000-0000-0000-0000-000000000001', 12
from public.product_variants;

insert into public.shipping_methods (name, description, price_cents, min_days, max_days, is_active, country_code)
values ('Entrega estándar', 'Envío a domicilio en Santo Domingo y alrededores', 25000, 1, 3, true, 'DO');

insert into public.app_settings (key, value)
values
  ('order_notification_email', 'jamilwilliams054@gmail.com'),
  ('whatsapp_number', '18097612875');
