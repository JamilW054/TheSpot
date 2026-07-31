-- =============================================================================
-- Buxxep — Recibo de compra: vínculo email_logs ↔ orders
-- =============================================================================
-- El recibo de compra (correo enviado tras confirmar el pago, vía Azul o
-- Payment Link) se audita en `email_logs` igual que los correos de enlace de
-- pago, pero se vincula al PEDIDO en vez de a una solicitud de pago (los
-- pedidos pagados con Azul no tienen `payment_requests`).
--
-- El índice único parcial garantiza como mecanismo la idempotencia del envío:
-- solo puede existir una fila `email_type = 'receipt'` por pedido, así que un
-- webhook duplicado o una confirmación repetida nunca reenvía el recibo (ver
-- lib/db/receipts.ts).
--
-- Cambios aditivos (columna nullable + índices): no rompen datos existentes.
-- =============================================================================

ALTER TABLE public.email_logs
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.email_logs.order_id IS
  'Pedido asociado (recibos de compra). payment_request_id se sigue usando para los correos de enlace de pago.';

CREATE INDEX IF NOT EXISTS idx_email_logs_order ON public.email_logs(order_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_logs_receipt_unique
  ON public.email_logs(order_id)
  WHERE email_type = 'receipt';
