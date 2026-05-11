-- =============================================================================
-- Buxxep — Product reviews / comments (one per user per product)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLE: product_reviews
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      smallint    NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

COMMENT ON TABLE  public.product_reviews          IS 'Customer reviews and ratings for products; one per user per product';
COMMENT ON COLUMN public.product_reviews.rating   IS 'Star rating 1–5';
COMMENT ON COLUMN public.product_reviews.body     IS 'Optional written comment';

-- Auto-update updated_at
CREATE TRIGGER set_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id    ON public.product_reviews(user_id);

-- -----------------------------------------------------------------------------
-- 3. RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read reviews
CREATE POLICY "reviews_select" ON public.product_reviews
  FOR SELECT USING (true);

-- Authenticated users can insert their own review
CREATE POLICY "reviews_insert_own" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update only their own review
CREATE POLICY "reviews_update_own" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete only their own review
CREATE POLICY "reviews_delete_own" ON public.product_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. GRANTS
-- -----------------------------------------------------------------------------
GRANT SELECT                        ON public.product_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE        ON public.product_reviews TO authenticated;
