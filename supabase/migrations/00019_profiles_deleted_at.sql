-- =============================================================================
-- Buxxep — Eliminación de cuenta con período de gracia (soft-delete)
-- =============================================================================
-- Run after 00018 en Supabase SQL Editor o: supabase db push
--
-- Añade `profiles.deleted_at`. Cuando un usuario solicita eliminar su cuenta,
-- la app escribe `deleted_at = now()` (no se usa ningún trigger ni función de
-- BD: toda la lógica vive en la capa de servidor — ver lib/auth/account-status.ts).
--
-- Flujo:
--   deleted_at NULL                    -> cuenta activa.
--   now() - deleted_at <= 30 días      -> al iniciar sesión se restaura (NULL).
--   now() - deleted_at  > 30 días      -> cuenta vencida; la purga la elimina.
--
-- La purga definitiva es una Edge Function (`purge-deleted-accounts`) invocada
-- por un cron externo; NO se duplica aquí. Borra los datos personales de las
-- cuentas con deleted_at de más de 30 días, conservando pedidos y pagos por
-- obligación legal.
-- =============================================================================

-- 1. Columna deleted_at (nullable, aditiva).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

COMMENT ON COLUMN public.profiles.deleted_at IS
  'Marca de eliminación (soft-delete). NULL = activa. La lógica de gracia de 30 días y la restauración viven en el backend de la app, no en la BD.';

-- 2. Índice parcial para que la purga localice rápido las cuentas marcadas.
CREATE INDEX IF NOT EXISTS profiles_deleted_at_idx
  ON public.profiles (deleted_at)
  WHERE deleted_at IS NOT NULL;
