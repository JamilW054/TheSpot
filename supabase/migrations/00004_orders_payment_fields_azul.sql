-- AZUL (Banco Popular) payment metadata on orders (Supabase source of truth).

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS azul_transaction_id text,
  ADD COLUMN IF NOT EXISTS azul_authorization_code text,
  ADD COLUMN IF NOT EXISTS azul_response_code text,
  ADD COLUMN IF NOT EXISTS azul_rrn text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_raw_response jsonb;

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'declined'));

COMMENT ON COLUMN public.orders.payment_status IS 'Gateway settlement (pending/paid/declined); fulfillment uses status';
COMMENT ON COLUMN public.orders.payment_provider IS 'e.g. AZUL';
COMMENT ON COLUMN public.orders.payment_raw_response IS 'Last gateway POST payload (redact PAN if logged)';
