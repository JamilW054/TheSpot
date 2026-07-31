-- =============================================================================
-- 00021_fix_orders_rls_isolation.sql
--
-- FIX CRÍTICO DE AISLAMIENTO DE DATOS (pedidos).
--
-- Síntoma: un cliente veía pedidos y direcciones de otros clientes. La causa es
-- que las lecturas de `orders` no quedaban restringidas al dueño (RLS apagada o
-- con una política demasiado permisiva). Las "direcciones de otros" eran en
-- realidad el `shipping_address` embebido dentro de esos pedidos ajenos.
--
-- Esta migración deja `orders`, `order_items` y `order_status_history` con RLS
-- ACTIVADA y con políticas que solo permiten al usuario acceder a SUS pedidos
-- (`user_id = auth.uid()`). El acceso público a un pedido por su ID (seguimiento)
-- y las operaciones de admin siguen funcionando porque usan la service role, que
-- no pasa por RLS.
--
-- NOTA: es autocontenida (DROP IF EXISTS + CREATE) para aplicarse sin depender
-- del estado actual de producción. No referencia `session_id` porque la tabla
-- `orders` de producción no tiene esa columna.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- orders
-- -----------------------------------------------------------------------------
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

-- Un usuario autenticado solo puede crear pedidos a su propio nombre (o un
-- pedido sin dueño asignado), nunca a nombre de OTRO usuario.
DROP POLICY IF EXISTS "orders_insert" ON public.orders;
CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "orders_update_own" ON public.orders;
CREATE POLICY "orders_update_own" ON public.orders
  FOR UPDATE USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- order_items: lectura/alta solo a través de un pedido propio
-- -----------------------------------------------------------------------------
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
CREATE POLICY "order_items_select" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
CREATE POLICY "order_items_insert" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id = auth.uid() OR o.user_id IS NULL)
    )
  );

-- -----------------------------------------------------------------------------
-- order_status_history: lectura solo a través de un pedido propio
-- (la inserción la hace el checkout con service role, que no pasa por RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_status_history_select" ON public.order_status_history;
CREATE POLICY "order_status_history_select" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id
        AND o.user_id = auth.uid()
    )
  );
