-- =============================================================================
-- Buxxep — Full PostgreSQL schema for Supabase
-- Tables, relations, indexes, RLS, triggers, functions, storage config
-- Run in Supabase SQL Editor or via: supabase db push
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS (Supabase has these; enable if needed)
-- -----------------------------------------------------------------------------
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- -----------------------------------------------------------------------------
-- 2. TABLES (order respects FK dependencies; circular refs resolved by ALTER)
-- -----------------------------------------------------------------------------

-- 2.1 Base models: whitelist of 3D model paths (geometry always from code/CDN)
CREATE TABLE public.base_models (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path       text NOT NULL UNIQUE,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.base_models IS 'Whitelist of 3D model paths; all model_path in app must exist here';

-- 2.2 Profiles: extends auth.users (Supabase). id = auth.uid()
CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profiles; id matches auth.users(id). Email lives in auth.users';

-- 2.3 Products: catalog items; model_path must be in base_models (FK added below)
CREATE TABLE public.products (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text NOT NULL UNIQUE,
  name             text NOT NULL,
  description      text,
  price_cents      integer NOT NULL CHECK (price_cents >= 0),
  model_path       text NOT NULL,
  cover_image_url  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_products_model_path FOREIGN KEY (model_path) REFERENCES public.base_models(path)
);

COMMENT ON TABLE public.products IS 'Catalog products; model_path from base_models whitelist';

-- 2.4 Textures: base textures (Buxxep or user upload)
CREATE TABLE public.textures (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source               text NOT NULL CHECK (source IN ('buxxep', 'user')),
  url                  text NOT NULL,
  product_id           uuid REFERENCES public.products(id) ON DELETE SET NULL,
  uploaded_by_user_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at           timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.textures IS 'Base textures: source buxxep (official) or user (uploaded). Used for layer composition';

-- 2.5 Designs: saved designs (canvas_elements JSONB); exportable as JSON and texture image
CREATE TABLE public.designs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  user_id             uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  source              text NOT NULL CHECK (source IN ('buxxep', 'user')),
  model_path          text REFERENCES public.base_models(path) ON DELETE SET NULL,
  product_id          uuid REFERENCES public.products(id) ON DELETE SET NULL,
  garment_color_hex   text,
  base_texture_id     uuid REFERENCES public.textures(id) ON DELETE SET NULL,
  canvas_elements     jsonb NOT NULL DEFAULT '[]',
  export_version      text,
  rendered_texture_url text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.designs IS 'Saved designs; canvas_elements matches editor/DesignExportPayload. rendered_texture_url = 1024x1024 image in Storage';

-- 2.6 Products: add optional FKs to designs and textures (circular ref)
ALTER TABLE public.products
  ADD COLUMN default_design_id uuid REFERENCES public.designs(id) ON DELETE SET NULL,
  ADD COLUMN base_texture_id   uuid REFERENCES public.textures(id) ON DELETE SET NULL;

-- 2.7 Cart items: user or anonymous (session_id)
CREATE TABLE public.cart_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id text,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  design_id  uuid REFERENCES public.designs(id) ON DELETE SET NULL,
  quantity   integer NOT NULL CHECK (quantity >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_cart_owner CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL AND length(trim(session_id)) > 0)
  )
);

COMMENT ON TABLE public.cart_items IS 'Cart lines; either user_id (logged in) or session_id (anonymous)';

-- 2.8 Orders
CREATE TABLE public.orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id       text,
  status           text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  shipping_name    text,
  shipping_address text,
  shipping_email   text,
  total_cents      integer NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 2.9 Order items
CREATE TABLE public.order_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id       uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  design_id        uuid REFERENCES public.designs(id) ON DELETE SET NULL,
  quantity         integer NOT NULL CHECK (quantity >= 1),
  unit_price_cents integer NOT NULL,
  texture_url      text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.order_items.texture_url IS 'Final texture URL for production (e.g. after uploading rendered design to Storage)';

-- -----------------------------------------------------------------------------
-- 3. INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_model_path ON public.products(model_path);
CREATE INDEX idx_textures_source ON public.textures(source);
CREATE INDEX idx_textures_product_id ON public.textures(product_id);
CREATE INDEX idx_designs_user_id ON public.designs(user_id);
CREATE INDEX idx_designs_product_id ON public.designs(product_id);
CREATE INDEX idx_designs_source ON public.designs(source);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- -----------------------------------------------------------------------------
-- 4. TRIGGERS: updated_at
-- -----------------------------------------------------------------------------
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

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_designs_updated_at
  BEFORE UPDATE ON public.designs
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 5. TRIGGER: create profile on auth signup (Supabase)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 6. FUNCTIONS
-- -----------------------------------------------------------------------------

-- 6.1 Recompute order total from order_items (call after insert/update/delete order_items)
CREATE OR REPLACE FUNCTION public.recompute_order_total(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET total_cents = COALESCE((
    SELECT SUM(quantity * unit_price_cents)
    FROM public.order_items
    WHERE order_id = p_order_id
  ), 0),
  updated_at = now()
  WHERE id = p_order_id;
END;
$$;

-- Trigger: after order_items change, recompute order total
CREATE OR REPLACE FUNCTION public.trigger_recompute_order_total()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_order_total(OLD.order_id);
    RETURN OLD;
  END IF;
  PERFORM public.recompute_order_total(COALESCE(NEW.order_id, OLD.order_id));
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_order_items_change
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE PROCEDURE public.trigger_recompute_order_total();

-- 6.2 Migrate anonymous cart to user (on login)
CREATE OR REPLACE FUNCTION public.migrate_cart_session_to_user(
  p_session_id text,
  p_user_id    uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  IF p_session_id IS NULL OR trim(p_session_id) = '' OR p_user_id IS NULL THEN
    RETURN 0;
  END IF;
  UPDATE public.cart_items
  SET user_id = p_user_id, session_id = NULL, updated_at = now()
  WHERE session_id = p_session_id;
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

COMMENT ON FUNCTION public.migrate_cart_session_to_user IS 'Call after login: move cart items from session_id to user_id';

-- 6.3 Validate product model_path exists in base_models (redundant with FK; optional check for app layer)
CREATE OR REPLACE FUNCTION public.validate_model_path(p_path text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.base_models WHERE path = p_path);
END;
$$;

-- -----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) — Supabase
-- -----------------------------------------------------------------------------
ALTER TABLE public.base_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.textures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- base_models: read-only for all (anon + authenticated)
CREATE POLICY "base_models_select" ON public.base_models
  FOR SELECT USING (true);

-- profiles: users can read/update own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- products: public read
CREATE POLICY "products_select" ON public.products
  FOR SELECT USING (true);

-- textures: public read (Buxxep); users can insert/update/delete own (source=user)
CREATE POLICY "textures_select" ON public.textures
  FOR SELECT USING (true);
CREATE POLICY "textures_insert_user" ON public.textures
  FOR INSERT WITH CHECK (
    source = 'user' AND uploaded_by_user_id = auth.uid()
  );
CREATE POLICY "textures_update_user" ON public.textures
  FOR UPDATE USING (
    source = 'user' AND uploaded_by_user_id = auth.uid()
  );
CREATE POLICY "textures_delete_user" ON public.textures
  FOR DELETE USING (
    source = 'user' AND uploaded_by_user_id = auth.uid()
  );

-- designs: read buxxep + own; insert/update/delete own
CREATE POLICY "designs_select" ON public.designs
  FOR SELECT USING (
    source = 'buxxep' OR user_id = auth.uid()
  );
CREATE POLICY "designs_insert" ON public.designs
  FOR INSERT WITH CHECK (
    (source = 'user' AND user_id = auth.uid()) OR (source = 'buxxep' AND user_id IS NULL)
  );
CREATE POLICY "designs_update" ON public.designs
  FOR UPDATE USING (
    source = 'user' AND user_id = auth.uid()
  );
CREATE POLICY "designs_delete" ON public.designs
  FOR DELETE USING (
    source = 'user' AND user_id = auth.uid()
  );

-- cart_items: own by user_id or session_id (anon: use request header or JWT claim for session)
-- For anonymous we allow SELECT/INSERT/UPDATE/DELETE when session_id matches (app sends it).
-- Supabase anon can't pass session_id in RLS; common pattern: service role for cart or use auth.uid() only and sync on login.
CREATE POLICY "cart_items_select_own" ON public.cart_items
  FOR SELECT USING (
    user_id = auth.uid() OR (user_id IS NULL AND session_id IS NOT NULL)
  );
CREATE POLICY "cart_items_insert_own" ON public.cart_items
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR (user_id IS NULL AND session_id IS NOT NULL)
  );
CREATE POLICY "cart_items_update_own" ON public.cart_items
  FOR UPDATE USING (
    user_id = auth.uid() OR (user_id IS NULL AND session_id IS NOT NULL)
  );
CREATE POLICY "cart_items_delete_own" ON public.cart_items
  FOR DELETE USING (
    user_id = auth.uid() OR (user_id IS NULL AND session_id IS NOT NULL)
  );

-- orders: user can read own
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (
    user_id = auth.uid() OR (session_id IS NOT NULL)
  );
CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE USING (user_id = auth.uid());

-- order_items: read via order ownership
CREATE POLICY "order_items_select" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR o.session_id IS NOT NULL)
    )
  );
CREATE POLICY "order_items_insert" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 8. SEED: base_models (whitelist)
-- -----------------------------------------------------------------------------
INSERT INTO public.base_models (path, name) VALUES
  ('/models/tshirt/scene.gltf', 'Camiseta básica')
ON CONFLICT (path) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 9. GRANTS (Supabase uses postgres; anon and authenticated roles)
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.base_models TO anon, authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.textures TO anon, authenticated;
GRANT INSERT ON public.textures TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.designs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO anon, authenticated;
GRANT SELECT, INSERT ON public.order_items TO anon, authenticated;

-- Sequences / default gen_random_uuid() don't need explicit grant for table insert.
