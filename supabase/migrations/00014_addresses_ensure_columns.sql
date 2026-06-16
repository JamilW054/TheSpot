-- Ensure addresses table has all required columns
-- Safe to run multiple times (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)

ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS full_name     text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_line1 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_line2 text,
  ADD COLUMN IF NOT EXISTS city          text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS postal_code   text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS country_code  text NOT NULL DEFAULT 'DO',
  ADD COLUMN IF NOT EXISTS phone         text,
  ADD COLUMN IF NOT EXISTS label         text,
  ADD COLUMN IF NOT EXISTS is_default    boolean NOT NULL DEFAULT false;

-- Remove defaults from NOT NULL columns (only needed for the ALTER above)
ALTER TABLE public.addresses
  ALTER COLUMN full_name     DROP DEFAULT,
  ALTER COLUMN address_line1 DROP DEFAULT,
  ALTER COLUMN city          DROP DEFAULT,
  ALTER COLUMN postal_code   DROP DEFAULT;

-- Refresh PostgREST schema cache so changes are visible immediately
NOTIFY pgrst, 'reload schema';
