-- El navegador lee `profiles.role` del usuario con sesión para saber si es
-- admin (auth-context / session-user). La policy `profiles_select_own` ya
-- limita a la propia fila, pero sin GRANT Postgres responde 42501
-- "permission denied for table profiles" y nadie puede entrar a /admin.
-- Solo SELECT: insertar/actualizar perfiles (y el rol) queda para service_role.

grant select on table public.profiles to authenticated;
