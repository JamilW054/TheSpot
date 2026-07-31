-- =============================================================================
-- Buxxep — Variantes por color (eje independiente, junto a tallas)
-- =============================================================================
-- Generaliza los "size presets" a presets tipados: 'size' (tallas) o 'color'.
-- Un producto puede variar por talla, por color, por ambos (matriz) o ninguno.
-- Las variantes ya guardan atributos en JSON (product_variants.attributes), por
-- lo que { size }, { color, hex } y { size, color, hex } funcionan sin cambios
-- de esquema en variantes/inventario/carrito (cart_items referencia variant_id).

-- 1) Tipo de preset: 'size' (por defecto, retrocompatible) o 'color'.
ALTER TABLE public.size_presets
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'size';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'size_presets_kind_check'
  ) THEN
    ALTER TABLE public.size_presets
      ADD CONSTRAINT size_presets_kind_check CHECK (kind IN ('size', 'color'));
  END IF;
END $$;

-- 2) Tabla de items del preset (la consulta el código pero no había migración).
--    Defensivo: crear si no existe y asegurar la columna del swatch de color.
CREATE TABLE IF NOT EXISTS public.size_preset_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preset_id  uuid NOT NULL REFERENCES public.size_presets(id) ON DELETE CASCADE,
  label      text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_size_preset_items_preset_id
  ON public.size_preset_items(preset_id);

-- Color hex del item (solo se usa cuando el preset es kind='color').
ALTER TABLE public.size_preset_items
  ADD COLUMN IF NOT EXISTS swatch_hex text;

-- RLS / grants: lectura pública (catálogo y formularios), igual que size_presets.
ALTER TABLE public.size_preset_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'size_preset_items'
      AND policyname = 'size_preset_items_select'
  ) THEN
    CREATE POLICY "size_preset_items_select" ON public.size_preset_items
      FOR SELECT USING (true);
  END IF;
END $$;

GRANT SELECT ON public.size_preset_items TO anon, authenticated;

-- 3) Congelar el color elegido en el ítem de pedido (size ya existe por 00013).
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS color text;

-- 4) Preset de color de ejemplo con swatches.
INSERT INTO public.size_presets (name, kind)
SELECT 'Colores básicos', 'color'
WHERE NOT EXISTS (
  SELECT 1 FROM public.size_presets WHERE name = 'Colores básicos'
);

INSERT INTO public.size_preset_items (preset_id, label, swatch_hex, sort_order)
SELECT p.id, v.label, v.hex, v.ord
FROM public.size_presets p
CROSS JOIN (VALUES
  ('Negro',  '#111111', 0),
  ('Blanco', '#ffffff', 1),
  ('Rojo',   '#e11d48', 2),
  ('Azul',   '#2563eb', 3),
  ('Verde',  '#16a34a', 4)
) AS v(label, hex, ord)
WHERE p.name = 'Colores básicos'
  AND NOT EXISTS (
    SELECT 1 FROM public.size_preset_items i WHERE i.preset_id = p.id
  );

-- 5) Forzar a PostgREST a recargar el esquema para que reconozca la tabla/columnas
--    nuevas de inmediato (si no, la API las "no encuentra" hasta el próximo reload).
NOTIFY pgrst, 'reload schema';
