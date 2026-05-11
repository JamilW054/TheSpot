-- =============================================================================
-- Buxxep — Add sizes array column to products
-- =============================================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.products.sizes IS 'Available sizes for this product (e.g. {XS,S,M,L,XL,XXL})';
