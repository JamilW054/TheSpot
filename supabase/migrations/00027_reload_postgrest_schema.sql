-- =============================================================================
-- Buxxep — Fuerza recarga del caché de esquema de PostgREST
-- =============================================================================
-- PostgREST cachea el mapa de relaciones (FKs) para resolver los embeds tipo
-- `profiles(username)`. Tras agregar la FK en 00026, ese caché puede tardar
-- unos segundos/minutos en refrescarse solo; este NOTIFY lo fuerza al
-- instante. No cambia el esquema — es solo una señal en tiempo de ejecución,
-- segura de re-ejecutar en cualquier momento.
-- =============================================================================

NOTIFY pgrst, 'reload schema';
