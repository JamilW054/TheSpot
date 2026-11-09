-- Número de pedido legible: los 8 primeros caracteres del UUID en mayúsculas.
-- Es lo que se muestra al cliente (#A09B3EF2), en correos y en WhatsApp, así
-- que /estado-pedido debe poder buscar por él.

alter table public.orders
  add column if not exists order_number text
  generated always as (upper(left(id::text, 8))) stored;

create index if not exists orders_order_number_idx on public.orders (order_number);
