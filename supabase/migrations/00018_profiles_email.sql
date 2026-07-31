-- =============================================================================
-- Buxxep — Correo del cliente en profiles (para mostrarlo sin consultar
-- auth.users en cada lectura del panel).
-- Run after 00017 en Supabase SQL Editor o: supabase db push
--
-- Solo agrega la columna y rellena los perfiles existentes. El correo de los
-- nuevos registros lo escribe la app (server action `syncProfileEmail`) justo
-- después del signUp — no se usa ningún trigger.
-- =============================================================================

-- 1. Columna email (nullable, aditiva).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

COMMENT ON COLUMN public.profiles.email IS
  'Correo del usuario (espejo de auth.users.email). Lo escribe la app al registrarse.';

-- 2. Relleno de los perfiles existentes desde auth.users (una sola vez).
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id
  AND p.email IS DISTINCT FROM u.email;
