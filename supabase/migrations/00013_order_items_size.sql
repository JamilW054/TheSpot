-- Agrega la talla seleccionada al ítem de pedido
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS size text;
