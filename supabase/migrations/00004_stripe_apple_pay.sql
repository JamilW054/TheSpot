-- ---------------------------------------------------------------------------
-- Pago en línea opcional (Apple Pay / tarjeta vía Stripe), en paralelo al
-- flujo manual por WhatsApp. `payment_provider` distingue cómo se cobró un
-- pedido; `stripe_payment_intent_id` enlaza el pedido con el PaymentIntent
-- de Stripe para que el webhook pueda marcarlo como pagado.
-- ---------------------------------------------------------------------------

alter table public.orders
  add column payment_provider text,
  add column stripe_payment_intent_id text;

create unique index orders_stripe_payment_intent_id_key
  on public.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;
