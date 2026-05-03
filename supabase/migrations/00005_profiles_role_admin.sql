-- =============================================================================
-- Buxxep — profiles.role + immutable role for authenticated clients
-- Run after 00004 in Supabase SQL Editor or: supabase db push
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'client';

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('client', 'admin'));

COMMENT ON COLUMN public.profiles.role IS 'client | admin; clients cannot change role via API (column GRANT). Admin solo vía script bootstrap / SQL explícito.';

-- Nuevos registros: siempre client hasta que service_role actualice la fila.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'client'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Solo pueden editar columnas de perfil que no sean role (el rol lo sube service_role / SQL).
REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (name, avatar_url, phone, updated_at) ON TABLE public.profiles TO authenticated;
