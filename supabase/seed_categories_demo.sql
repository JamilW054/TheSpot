-- -----------------------------------------------------------------------------
-- Opcional: ejecutar en Supabase → SQL Editor si el catálogo solo muestra 3 categorías.
-- La app NO usa mocks: lee siempre `public.categories`. Este script solo rellena datos.
--
-- Requiere: tabla `categories` (migración 00003 o 00008). La columna `image_url`
-- se crea aquí si no existe.
-- -----------------------------------------------------------------------------
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url text;

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
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  image_url = EXCLUDED.image_url,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- Extra categorías + etiquetas demo (equivalente migración 00009)
-- -----------------------------------------------------------------------------
INSERT INTO public.categories (id, slug, name, sort_order, image_url) VALUES
  ('c1000000-0000-4000-8000-000000000013'::uuid, 'bano-y-playa', 'Baño y playa', 12,
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000014'::uuid, 'ropa-deportiva', 'Ropa deportiva', 13,
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000015'::uuid, 'camisas-formales', 'Camisas formales', 14,
    'https://images.unsplash.com/photo-1596755094514-f87e34085b87?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000016'::uuid, 'faldas-y-shorts', 'Faldas y shorts', 15,
    'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000017'::uuid, 'jerseys-y-sueters', 'Jerseys y suéteres', 16,
    'https://images.unsplash.com/photo-1576871337632-b9faef02c656?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000018'::uuid, 'conjuntos', 'Conjuntos', 17,
    'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000019'::uuid, 'denim', 'Denim', 18,
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000020'::uuid, 'pijamas', 'Pijamas y descanso', 19,
    'https://images.unsplash.com/photo-1617336537578-f30aaa434bdd?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000021'::uuid, 'outerwear-ligero', 'Outerwear ligero', 20,
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop'),
  ('c1000000-0000-4000-8000-000000000022'::uuid, 'streetwear', 'Streetwear', 21,
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=400&fit=crop')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  image_url = EXCLUDED.image_url,
  updated_at = now();

UPDATE public.products SET tags = ARRAY['basico','algodon']::text[] WHERE slug = 'camiseta-basica';
UPDATE public.products SET tags = ARRAY['personalizable','editor']::text[] WHERE slug = 'camiseta-personalizable';
UPDATE public.products SET tags = ARRAY['verano','fresco']::text[] WHERE slug = 'camiseta-verano';
UPDATE public.products SET tags = ARRAY['minimal','urbano']::text[] WHERE slug = 'camiseta-minimal';
UPDATE public.products SET tags = ARRAY['unisex','basico']::text[] WHERE slug = 'camiseta-unisex';
UPDATE public.products SET tags = ARRAY['algodon','premium']::text[] WHERE slug = 'camiseta-algodon';

