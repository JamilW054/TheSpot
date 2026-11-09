-- `sendOrderReceiptEmail` registra destinatario y resultado del envío; sin
-- estas columnas el insert fallaba y el recibo al cliente nunca se enviaba.

alter table public.email_logs
  add column if not exists recipient_email text,
  add column if not exists delivery_status text,
  add column if not exists provider_response jsonb,
  add column if not exists sent_at timestamptz;
