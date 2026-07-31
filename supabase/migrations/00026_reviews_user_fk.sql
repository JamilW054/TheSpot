-- =============================================================================
-- Buxxep — FK reviews.user_id → profiles.id
-- =============================================================================
-- La migración 00010 declaraba esta FK, pero la tabla real `reviews` (creada
-- fuera de las migraciones rastreadas) nunca la tuvo: `user_id` es un uuid
-- suelto sin constraint. Sin la FK, PostgREST no puede resolver el embed
-- `profiles(username)` en las consultas de reseñas (error PGRST200), que es
-- lo que usa el admin/tienda para mostrar el username del autor de la reseña
-- en vez de "Cliente" genérico.
-- =============================================================================

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
