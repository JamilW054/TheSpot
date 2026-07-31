-- =============================================================================
-- Buxxep — Coste de producto, comisión AZUL e índices de analítica
-- =============================================================================
-- Soporta el módulo de productos del admin (beneficio neto y margen por
-- artículo) y las agregaciones del dashboard.
--
--   Beneficio neto = precio de venta − coste − (precio × comisión AZUL)
--   Margen (%)     = beneficio neto / precio de venta
-- =============================================================================

-- 1. Coste unitario del producto (céntimos DOP). 0 = sin registrar.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cost_cents integer NOT NULL DEFAULT 0
    CONSTRAINT products_cost_cents_check CHECK (cost_cents >= 0);

COMMENT ON COLUMN public.products.cost_cents IS
  'Coste unitario en céntimos; usado por el admin para beneficio neto y margen.';

-- 2. Comisión de la pasarela AZUL como porcentaje (texto en app_settings,
--    editable desde /admin/config sin nueva migración).
INSERT INTO public.app_settings (key, value)
VALUES ('azul_commission_percent', '5.00')
ON CONFLICT (key) DO NOTHING;

-- 3. Consistencia: algunos entornos remotos no tienen created_at en
--    order_items (deriva del esquema). Se añade antes de indexarla; las
--    filas existentes reciben now() como aproximación.
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- 4. Índices para las agregaciones del dashboard (ventanas por fecha y
--    filtros por estado de pago). IF NOT EXISTS: seguro sobre datos existentes.
CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc
  ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_created_at
  ON public.order_items(created_at);
