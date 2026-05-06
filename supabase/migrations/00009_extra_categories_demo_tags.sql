-- -----------------------------------------------------------------------------
-- Buxxep — Más categorías demo + etiquetas en productos (filtros del catálogo)
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

UPDATE public.products SET tags = ARRAY['basico','algodon']::text[]
WHERE slug = 'camiseta-basica';

UPDATE public.products SET tags = ARRAY['personalizable','editor']::text[]
WHERE slug = 'camiseta-personalizable';

UPDATE public.products SET tags = ARRAY['verano','fresco']::text[]
WHERE slug = 'camiseta-verano';

UPDATE public.products SET tags = ARRAY['minimal','urbano']::text[]
WHERE slug = 'camiseta-minimal';

UPDATE public.products SET tags = ARRAY['unisex','basico']::text[]
WHERE slug = 'camiseta-unisex';

UPDATE public.products SET tags = ARRAY['algodon','premium']::text[]
WHERE slug = 'camiseta-algodon';
