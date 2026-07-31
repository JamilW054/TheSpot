-- =============================================================================
-- Buxxep — Habilita "Pay with Azul" en el selector de método de pago
-- =============================================================================
-- La migración 00016 sembró el método 'azul' deshabilitado ("Próximamente")
-- a la espera de completar la integración del PaymentPage (AuthHash, retorno
-- firmado, actualización idempotente del pedido). Con la integración lista
-- (ver src/features/payments/services/azul-checkout.service.ts), se habilita
-- para que los clientes puedan seleccionarlo en /carrito/checkout.
-- =============================================================================

UPDATE public.payment_methods
SET is_active = true,
    is_disabled = false,
    badge_label = NULL,
    updated_at = now()
WHERE code = 'azul';
