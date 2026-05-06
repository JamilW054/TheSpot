-- -----------------------------------------------------------------------------
-- Buxxep — Categories table + tile images (safe when 00003 was skipped)
-- -----------------------------------------------------------------------------
-- 1) Ensure updated_at helper exists (normally from 00001).
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) Table categories (same shape as 00003).
CREATE TABLE IF NOT EXISTS public.categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text NOT NULL UNIQUE,
  name       text NOT NULL,
  parent_id  uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.categories IS 'Product categories; parent_id for hierarchy';

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select" ON public.categories;
CREATE POLICY "categories_select" ON public.categories
  FOR SELECT USING (true);

GRANT SELECT ON public.categories TO anon, authenticated;

-- 3) Tile image column + seed rows.
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url text;

COMMENT ON COLUMN public.categories.image_url IS 'Thumbnail URL for catalog category tiles (e.g. images.unsplash.com)';

-- Coherent demo categories for a clothing store (≥10). Upsert by slug so existing DBs update safely.
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
