-- =============================================================================
-- Buxxep — Add missing tables, relations and columns (no overwrite of 00001)
-- Run after 00001 and 00002. Uses ALTER ADD COLUMN for existing tables.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ALTER existing tables: add missing columns only
-- -----------------------------------------------------------------------------

-- profiles: avatar and contact
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS phone text;

COMMENT ON COLUMN public.profiles.avatar_url IS 'Profile picture URL (e.g. Storage)';
COMMENT ON COLUMN public.profiles.phone IS 'Contact phone';

-- products: visibility and ordering
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.products.published IS 'Visible in catalog when true';
COMMENT ON COLUMN public.products.sort_order IS 'Display order (lower first)';

-- designs: align with app Design type (slug, description, cover, gallery)
ALTER TABLE public.designs
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS gallery jsonb NOT NULL DEFAULT '[]';

COMMENT ON COLUMN public.designs.slug IS 'URL-friendly identifier; unique when set (nullable allowed)';
COMMENT ON COLUMN public.designs.gallery IS 'Array of image URLs for gallery';

-- Unique slug when not null (multiple rows can have slug NULL until set)
CREATE UNIQUE INDEX IF NOT EXISTS idx_designs_slug_unique ON public.designs(slug) WHERE slug IS NOT NULL;

-- orders: full shipping and payment
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_phone text,
  ADD COLUMN IF NOT EXISTS shipping_city text,
  ADD COLUMN IF NOT EXISTS shipping_postal_code text,
  ADD COLUMN IF NOT EXISTS shipping_country text,
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS notes text;

COMMENT ON COLUMN public.orders.payment_id IS 'External payment provider reference (Stripe, etc.)';

-- textures: optional metadata
ALTER TABLE public.textures
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS mime_type text;

-- -----------------------------------------------------------------------------
-- 2. NEW TABLE: lineas (product lines / collections)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lineas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text NOT NULL UNIQUE,
  name             text NOT NULL,
  description      text,
  cover_image_url  text,
  gallery          jsonb NOT NULL DEFAULT '[]',
  published        boolean NOT NULL DEFAULT true,
  sort_order       integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.lineas IS 'Product lines / collections (e.g. "Verano 2024"); many-to-many with products';

CREATE TRIGGER set_lineas_updated_at
  BEFORE UPDATE ON public.lineas
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. NEW TABLE: product_lineas (many-to-many product <-> linea)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_lineas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  linea_id   uuid NOT NULL REFERENCES public.lineas(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, linea_id)
);

COMMENT ON TABLE public.product_lineas IS 'Junction: which products belong to which lineas';

CREATE INDEX IF NOT EXISTS idx_product_lineas_product_id ON public.product_lineas(product_id);
CREATE INDEX IF NOT EXISTS idx_product_lineas_linea_id ON public.product_lineas(linea_id);

-- -----------------------------------------------------------------------------
-- 4. NEW TABLE: categories (product categories, optional tree via parent_id)
-- -----------------------------------------------------------------------------
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

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- products: link to category (ALTER)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- -----------------------------------------------------------------------------
-- 5. NEW TABLE: addresses (user shipping/billing addresses)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addresses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label         text,
  full_name     text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city          text NOT NULL,
  postal_code   text NOT NULL,
  country_code  text NOT NULL DEFAULT 'ES',
  phone         text,
  is_default    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.addresses IS 'User addresses for checkout and shipping';

CREATE TRIGGER set_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- Optional: only one default per user (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_user_default
  ON public.addresses(user_id) WHERE is_default = true;

-- -----------------------------------------------------------------------------
-- 6. NEW TABLE: order_status_history (audit trail for order status)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status     text NOT NULL CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.order_status_history IS 'Audit log of order status changes';

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

-- Trigger: append to history when orders.status changes
CREATE OR REPLACE FUNCTION public.record_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, status, note)
    VALUES (NEW.id, NEW.status, NULL);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_orders_status_change ON public.orders;
CREATE TRIGGER after_orders_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.record_order_status_change();

-- -----------------------------------------------------------------------------
-- 7. Indexes on existing tables for new columns (if not already present)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_designs_slug ON public.designs(slug);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- -----------------------------------------------------------------------------
-- 8. RLS for new tables
-- -----------------------------------------------------------------------------
ALTER TABLE public.lineas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_lineas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- lineas: public read (filter published in app for catalog)
CREATE POLICY "lineas_select" ON public.lineas
  FOR SELECT USING (true);

-- product_lineas: public read
CREATE POLICY "product_lineas_select" ON public.product_lineas
  FOR SELECT USING (true);

-- categories: public read
CREATE POLICY "categories_select" ON public.categories
  FOR SELECT USING (true);

-- addresses: own only
CREATE POLICY "addresses_select_own" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "addresses_insert_own" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_update_own" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "addresses_delete_own" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

-- order_status_history: read via order ownership
CREATE POLICY "order_status_history_select" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id
      AND (o.user_id = auth.uid() OR o.session_id IS NOT NULL)
    )
  );

-- -----------------------------------------------------------------------------
-- 9. GRANTS for new tables
-- -----------------------------------------------------------------------------
GRANT SELECT ON public.lineas TO anon, authenticated;
GRANT SELECT ON public.product_lineas TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT SELECT ON public.order_status_history TO anon, authenticated;

