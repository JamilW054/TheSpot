-- JW — privilegios de lectura pública del catálogo.
--
-- En el CLI reciente de Supabase las tablas nuevas del schema public NO se
-- exponen automáticamente a `anon`/`authenticated`. RLS solo aplica después
-- del GRANT: sin esto el catálogo público falla con
-- "permission denied for table …" (42501).

grant usage on schema public to anon, authenticated, service_role;

grant select on table public.brands to anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant select on table public.size_presets to anon, authenticated;
grant select on table public.size_preset_items to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select on table public.product_media to anon, authenticated;
grant select on table public.product_variants to anon, authenticated;
grant select on table public.tags to anon, authenticated;
grant select on table public.product_tags to anon, authenticated;
grant select on table public.shipping_methods to anon, authenticated;

-- El resto de tablas (orders, inventory, coupons, settings, …) queda sin
-- GRANT a anon: solo service_role las usa, coherente con 00002.

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;
