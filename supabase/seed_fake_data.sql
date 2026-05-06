-- =============================================================================
-- Buxxep — Seed: datos falsos para desarrollo
-- Todas las prendas públicas son camisetas con el mismo model_path (/models/tshirt/scene.gltf)
-- Ejecutar después de migraciones (incl. 00008 categories.image_url)
-- =============================================================================

-- model_path por defecto en productos: /models/tshirt/scene.gltf (debe existir en base_models)

-- -----------------------------------------------------------------------------
-- 1. CATEGORÍAS (tienda de ropa — miniaturas Unsplash para el catálogo)
-- -----------------------------------------------------------------------------
INSERT INTO public.categories (id, slug, name, sort_order, image_url) VALUES
  ('c1000000-0000-4000-8000-000000000001'::uuid, 'camisetas', 'Camisetas', 0,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000002'::uuid, 'basicos', 'Básicos', 1,
    'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000003'::uuid, 'unisex', 'Unisex', 2,
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000004'::uuid, 'gorras-y-gorros', 'Gorras y gorros', 3,
    'https://images.unsplash.com/photo-1514326536292-377554641cff?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000005'::uuid, 'abrigos-y-chaquetas', 'Abrigos y chaquetas', 4,
    'https://images.unsplash.com/photo-1539533018447-63fcce585a9f?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000006'::uuid, 'sudaderas', 'Sudaderas y hoodies', 5,
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000007'::uuid, 'pantalones-y-jeans', 'Pantalones y jeans', 6,
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000008'::uuid, 'vestidos', 'Vestidos', 7,
    'https://images.unsplash.com/photo-1745695894760-600be9c8c307?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000009'::uuid, 'ropa-interior', 'Ropa interior', 8,
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000010'::uuid, 'calzado', 'Calzado', 9,
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000011'::uuid, 'accesorios', 'Accesorios', 10,
    'https://images.unsplash.com/photo-1611652026749-79d53ac08265?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000012'::uuid, 'ninos', 'Niños', 11,
    'https://images.unsplash.com/photo-1615397587950-3cbb55f95b77?w=400&h=400&fit=crop')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  image_url = EXCLUDED.image_url;

-- -----------------------------------------------------------------------------
-- 2. LÍNEAS (colecciones)
-- -----------------------------------------------------------------------------
INSERT INTO public.lineas (id, slug, name, description, published, sort_order) VALUES
  ('a2000000-0000-4000-8000-000000000001'::uuid, 'verano-2024', 'Verano 2024', 'Línea de camisetas para el verano. Diseña la tuya.', true, 0),
  ('a2000000-0000-4000-8000-000000000002'::uuid, 'basicos', 'Básicos', 'Camisetas básicas de algodón. Todas comparten el mismo corte.', true, 1),
  ('a2000000-0000-4000-8000-000000000003'::uuid, 'coleccion-minimal', 'Colección minimal', 'Estilo minimal. Personaliza en el editor.', true, 2)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. TEXTURAS (Buxxep) — placeholder URL; luego puedes subir a Storage
-- -----------------------------------------------------------------------------
INSERT INTO public.textures (id, source, url, name, mime_type) VALUES
  ('b3000000-0000-4000-8000-000000000001'::uuid, 'buxxep', 'https://placehold.co/1024x1024/ffffff/eee?text=Buxxep+Base', 'Base blanca', 'image/png'),
  ('b3000000-0000-4000-8000-000000000002'::uuid, 'buxxep', 'https://placehold.co/1024x1024/f5f5f5/e0e0e0?text=Base+Gris', 'Base gris claro', 'image/png')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. DISEÑOS PLANTILLA (Buxxep) — plantilla camiseta, canvas vacío o simple
-- -----------------------------------------------------------------------------
INSERT INTO public.designs (id, name, slug, source, model_path, garment_color_hex, canvas_elements, export_version) VALUES
  ('d4000000-0000-4000-8000-000000000001'::uuid, 'Plantilla básica', 'plantilla-basica', 'buxxep', '/models/tshirt/scene.gltf', '#ffffff', '[]', '1.0'),
  ('d4000000-0000-4000-8000-000000000002'::uuid, 'Camiseta verano', 'camiseta-verano', 'buxxep', '/models/tshirt/scene.gltf', '#87ceeb', '[]', '1.0'),
  ('d4000000-0000-4000-8000-000000000003'::uuid, 'Minimal', 'minimal', 'buxxep', '/models/tshirt/scene.gltf', '#f5f5f5', '[]', '1.0')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. PRODUCTOS — todas camisetas con el mismo model_path, publicadas
-- -----------------------------------------------------------------------------
INSERT INTO public.products (
  id,
  slug,
  name,
  description,
  price_cents,
  model_path,
  cover_image_url,
  default_design_id,
  base_texture_id,
  category_id,
  published,
  sort_order
) VALUES
  ('a5000000-0000-4000-8000-000000000001'::uuid, 'camiseta-basica', 'Camiseta básica', 'Camiseta de algodón. Personalízala en el editor.', 2499, '/models/tshirt/scene.gltf', 'https://placehold.co/600x600/fff/333?text=Camiseta+Basica', 'd4000000-0000-4000-8000-000000000001'::uuid, 'b3000000-0000-4000-8000-000000000001'::uuid, 'c1000000-0000-4000-8000-000000000001'::uuid, true, 0),
  ('a5000000-0000-4000-8000-000000000002'::uuid, 'camiseta-personalizable', 'Camiseta personalizable', 'Diseña tu camiseta en el editor. Mismo modelo para todas.', 2699, '/models/tshirt/scene.gltf', 'https://placehold.co/600x600/eee/333?text=Personalizable', 'd4000000-0000-4000-8000-000000000001'::uuid, 'b3000000-0000-4000-8000-000000000001'::uuid, 'c1000000-0000-4000-8000-000000000001'::uuid, true, 1),
  ('a5000000-0000-4000-8000-000000000003'::uuid, 'camiseta-verano', 'Camiseta verano', 'Corte fresco para verano. Lista para personalizar.', 2299, '/models/tshirt/scene.gltf', 'https://placehold.co/600x600/87ceeb/333?text=Verano', 'd4000000-0000-4000-8000-000000000002'::uuid, 'b3000000-0000-4000-8000-000000000001'::uuid, 'c1000000-0000-4000-8000-000000000001'::uuid, true, 2),
  ('a5000000-0000-4000-8000-000000000004'::uuid, 'camiseta-minimal', 'Camiseta minimal', 'Estilo minimal. Plantilla camiseta estándar.', 2599, '/models/tshirt/scene.gltf', 'https://placehold.co/600x600/f5f5f5/333?text=Minimal', 'd4000000-0000-4000-8000-000000000003'::uuid, 'b3000000-0000-4000-8000-000000000002'::uuid, 'c1000000-0000-4000-8000-000000000002'::uuid, true, 3),
  ('a5000000-0000-4000-8000-000000000005'::uuid, 'camiseta-unisex', 'Camiseta unisex', 'Unisex, algodón. Personaliza en el editor.', 2399, '/models/tshirt/scene.gltf', 'https://placehold.co/600x600/e8e8e8/333?text=Unisex', 'd4000000-0000-4000-8000-000000000001'::uuid, 'b3000000-0000-4000-8000-000000000001'::uuid, 'c1000000-0000-4000-8000-000000000003'::uuid, true, 4),
  ('a5000000-0000-4000-8000-000000000006'::uuid, 'camiseta-algodon', 'Camiseta algodón', '100% algodón. Mismo modelo que el resto de camisetas.', 2799, '/models/tshirt/scene.gltf', 'https://placehold.co/600x600/fff8dc/333?text=Algodon', 'd4000000-0000-4000-8000-000000000002'::uuid, 'b3000000-0000-4000-8000-000000000001'::uuid, 'c1000000-0000-4000-8000-000000000002'::uuid, true, 5)
ON CONFLICT (id) DO NOTHING;

-- Evitar conflicto por slug (si ya existen productos con mismo slug, usar ON CONFLICT (slug))
-- Si tu tabla no tiene UNIQUE(slug) en id, puede dar error; entonces ejecuta por lotes o usa ON CONFLICT (slug) DO NOTHING.
-- Como products tiene UNIQUE(slug), el primer INSERT puede fallar si ya existen. Usamos ON CONFLICT (id) para los que tienen id fijo.
-- Para inserts que no especifican id, no hay conflicto. Aquí todos tienen id fijo → ON CONFLICT (id) DO NOTHING.

-- -----------------------------------------------------------------------------
-- 6. PRODUCT_LINEAS (relacionar productos con líneas)
-- -----------------------------------------------------------------------------
INSERT INTO public.product_lineas (product_id, linea_id, sort_order)
SELECT p.id, l.id, row_number() OVER () - 1
FROM (VALUES
  ('a5000000-0000-4000-8000-000000000001'::uuid, 'a2000000-0000-4000-8000-000000000001'::uuid),
  ('a5000000-0000-4000-8000-000000000002'::uuid, 'a2000000-0000-4000-8000-000000000001'::uuid),
  ('a5000000-0000-4000-8000-000000000003'::uuid, 'a2000000-0000-4000-8000-000000000001'::uuid),
  ('a5000000-0000-4000-8000-000000000001'::uuid, 'a2000000-0000-4000-8000-000000000002'::uuid),
  ('a5000000-0000-4000-8000-000000000004'::uuid, 'a2000000-0000-4000-8000-000000000002'::uuid),
  ('a5000000-0000-4000-8000-000000000005'::uuid, 'a2000000-0000-4000-8000-000000000002'::uuid),
  ('a5000000-0000-4000-8000-000000000004'::uuid, 'a2000000-0000-4000-8000-000000000003'::uuid),
  ('a5000000-0000-4000-8000-000000000006'::uuid, 'a2000000-0000-4000-8000-000000000003'::uuid)
) AS v(pid, lid)
JOIN public.products p ON p.id = v.pid
JOIN public.lineas l ON l.id = v.lid
ON CONFLICT (product_id, linea_id) DO NOTHING;

-- (Si product_lineas no tiene constraint UNIQUE(product_id, linea_id), quita el ON CONFLICT)

-- -----------------------------------------------------------------------------
-- 7. OPCIONAL: vincular texturas a productos (product_id en textures)
-- -----------------------------------------------------------------------------
UPDATE public.textures
SET product_id = 'a5000000-0000-4000-8000-000000000001'::uuid
WHERE id = 'b3000000-0000-4000-8000-000000000001'::uuid;

UPDATE public.textures
SET product_id = 'a5000000-0000-4000-8000-000000000004'::uuid
WHERE id = 'b3000000-0000-4000-8000-000000000002'::uuid;

-- -----------------------------------------------------------------------------
-- Resumen
-- -----------------------------------------------------------------------------
-- Categorías: 3 (camisetas, básicos, unisex)
-- Líneas: 3 (Verano 2024, Básicos, Colección minimal)
-- Texturas Buxxep: 2 (base blanca, base gris)
-- Diseños plantilla: 3 (todos model_path = /models/tshirt/scene.gltf)
-- Productos: 6 camisetas publicadas, mismo model_path
-- product_lineas: 8 enlaces producto ↔ línea
