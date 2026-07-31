-- 00028_shipping_rates.sql
-- Tarifas de envío: Estándar RD$350, Premium RD$500 y un método gratis de testing.
-- Idempotente: se puede reejecutar sin duplicar filas.

-- Estándar: 1-3 días hábiles, RD$350.00
update public.shipping_methods
set price_cents = 35000,
    description  = coalesce(description, '1-3 días hábiles'),
    min_days     = coalesce(min_days, 1),
    max_days     = coalesce(max_days, 3),
    is_active    = true
where deleted_at is null
  and (name ilike 'estandar' or name ilike 'estándar');

-- Premium: antes de las 8pm, RD$500.00
update public.shipping_methods
set price_cents = 50000,
    description = coalesce(description, 'Antes de la 8pm'),
    is_active   = true
where deleted_at is null
  and name ilike 'premium';

-- Método gratuito para pruebas.
insert into public.shipping_methods (name, description, price_cents, is_active, country_code)
select 'Testing', 'Envío de prueba (gratis)', 0, true, 'DO'
where not exists (
  select 1 from public.shipping_methods
  where name ilike 'testing' and deleted_at is null
);

notify pgrst, 'reload schema';
