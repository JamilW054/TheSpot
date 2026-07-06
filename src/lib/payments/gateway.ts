/**
 * Abstracción de pasarela de pago (Strategy pattern).
 *
 * Cada proveedor (AZUL, y en el futuro Stripe/CardNet/PayPal/etc.) implementa
 * `PaymentGateway.createRedirect`, que valida el pedido y devuelve el HTML de
 * auto-envío hacia la página de pago hospedada del proveedor. El código que
 * dispara el pago (rutas API, checkout) depende únicamente de esta interfaz
 * — nunca importa un servicio de proveedor concreto — así que añadir una
 * pasarela nueva no requiere tocar la lógica de negocio existente.
 */

export interface PaymentGatewayRedirectInput {
  /** Pedido a pagar (debe pertenecer al usuario autenticado). */
  orderId: string;
  /** Origen público de la app, usado para construir URLs de retorno/webhook. */
  baseUrl: string;
}

export type PaymentGatewayRedirectResult =
  | { ok: true; html: string }
  | { ok: false; status: number; message: string };

export interface PaymentGateway {
  /** Código del método de pago (coincide con `payment_methods.code`). */
  readonly code: string;
  createRedirect(
    input: PaymentGatewayRedirectInput,
  ): Promise<PaymentGatewayRedirectResult>;
}
