-- =============================================================================
-- Buxxep — Size presets por categoría
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.size_presets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  sizes      text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_size_presets_updated_at ON public.size_presets;
CREATE TRIGGER set_size_presets_updated_at
  BEFORE UPDATE ON public.size_presets
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS size_preset_id uuid REFERENCES public.size_presets(id) ON DELETE SET NULL;

-- RLS: solo admins pueden escribir; lectura pública para catálogo y producto form
ALTER TABLE public.size_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "size_presets_select" ON public.size_presets
  FOR SELECT USING (true);

GRANT SELECT ON public.size_presets TO anon, authenticated;

-- Presets de ejemplo
INSERT INTO public.size_presets (name, sizes, sort_order) VALUES
  ('Ropa',       ARRAY['XS','S','M','L','XL','XXL','XXXL'], 0),
  ('Calzado',    ARRAY['35','36','37','38','39','40','41','42','43','44','45'], 1),
  ('Gorras',     ARRAY['S/M','M/L','L/XL','Talla única'], 2),
  ('Accesorios', ARRAY['Talla única'], 3)
ON CONFLICT DO NOTHING;
