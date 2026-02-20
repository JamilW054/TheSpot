-- =============================================================================
-- Buxxep — Storage: buckets and RLS policies (Supabase)
-- Run after 00001_buxxep_full_schema.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. BUCKETS
-- Create via Supabase Dashboard or uncomment and run (schema may vary by version).
-- Bucket IDs: textures (user uploads + Buxxep refs), rendered (design 1024x1024)
-- -----------------------------------------------------------------------------

-- Create buckets in Dashboard (Storage → New bucket) or via JS:
--   supabase.storage.createBucket('textures', { public: true, fileSizeLimit: 5242880, allowedMimeTypes: ['image/png','image/jpeg','image/webp'] })
--   supabase.storage.createBucket('rendered', { public: false, fileSizeLimit: 2097152, allowedMimeTypes: ['image/png'] })
--
-- Buckets to create:
--   - textures: base texture uploads (user/Buxxep); public read recommended.
--   - rendered: 1024×1024 design output for orders; private.
--
-- After creating buckets, run the policies below.

-- -----------------------------------------------------------------------------
-- 2. RLS POLICIES ON storage.objects
-- -----------------------------------------------------------------------------

-- textures bucket: public read; authenticated can upload/update/delete own
CREATE POLICY "textures_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'textures');

CREATE POLICY "textures_insert_authenticated"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'textures'
    AND (storage.extension(name) = 'png' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'jpg' OR storage.extension(name) = 'webp')
  );

CREATE POLICY "textures_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'textures' AND owner = auth.uid());

CREATE POLICY "textures_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'textures' AND owner = auth.uid());

-- rendered bucket: private; only authenticated can insert (app/server); read for order fulfillment
CREATE POLICY "rendered_select_authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'rendered');

CREATE POLICY "rendered_insert_authenticated"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'rendered'
    AND storage.extension(name) = 'png'
  );

-- Service role can always access; anon has no access to 'rendered'.
