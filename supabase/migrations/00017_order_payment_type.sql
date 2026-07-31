-- =============================================================================
-- Buxxep — Tipo de pago en pedidos + enlace solicitud↔pedido
-- =============================================================================
-- Cada pedido registra su "Payment Type":
--   PAYMENT_LINK  enlace de pago manual (gestionado desde /admin/pagos)
--   AZUL_PAYMENT  pasarela de tarjetas Azul (estado controlado por Azul)
--
-- Además, `payment_requests` gana `order_id` para asociar la solicitud al pedido
-- y poder mostrar la vista previa de productos (imagen, nombre, cantidad,
-- precio unitario y total) en el Centro de pagos del cliente.
--
-- Cambios aditivos (columnas nullable / índices): no rompen datos existentes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. orders.payment_type
-- -----------------------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_type text;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_type_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_type_check
  CHECK (payment_type IS NULL OR payment_type IN ('PAYMENT_LINK', 'AZUL_PAYMENT'));

COMMENT ON COLUMN public.orders.payment_type IS
  'Tipo de cobro del pedido: PAYMENT_LINK (enlace manual) | AZUL_PAYMENT (pasarela Azul).';

CREATE INDEX IF NOT EXISTS idx_orders_payment_type ON public.orders(payment_type);

-- -----------------------------------------------------------------------------
-- 2. payment_requests.order_id — enlaza la solicitud con su pedido
-- -----------------------------------------------------------------------------
ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.payment_requests.order_id IS
  'Pedido asociado (si la solicitud nace del checkout). Permite la vista previa de productos.';

CREATE INDEX IF NOT EXISTS idx_payment_requests_order ON public.payment_requests(order_id);
