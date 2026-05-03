-- =============================================================================
-- Buxxep — Marcar usuarios como admin en public.profiles (sin tocar auth.users)
-- Ejecuta en SQL Editor después de 00005. Ajusta la lista de emails a tu equipo.
-- =============================================================================

UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE u.id = p.id
  AND lower(trim(u.email)) = ANY (
    ARRAY[
      'biandy@buxxep.local',
      'biandyprenda@gmail.com',
      'biandyprenda06@gmail.com'
    ]
  );

-- Opcional: descomenta si estas cuentas deben ser admin también.
-- UPDATE public.profiles p
-- SET role = 'admin'
-- FROM auth.users u
-- WHERE u.id = p.id
--   AND lower(trim(u.email)) IN ('katia@g3deon.com', 'nkatia.g3@gmail.com');
