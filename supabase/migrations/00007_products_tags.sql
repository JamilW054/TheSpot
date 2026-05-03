-- Etiquetas de producto (búsqueda / filtros). Slug de URL sigue existiendo pero se genera en servidor.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.products.tags IS 'Tags for catalog (lowercase, trimmed); max length enforced in app';
