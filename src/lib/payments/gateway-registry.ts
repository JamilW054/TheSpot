import { azulGateway } from "@/features/payments/services/azul-checkout.service";
import type { PaymentGateway } from "./gateway";

/**
 * Registro de pasarelas de pago disponibles (Strategy pattern). Añadir un
 * proveedor nuevo (Stripe, CardNet, PayPal, AZUL Directa…) es agregar una
 * entrada aquí — el resto del flujo de pago no cambia.
 */
const GATEWAYS: Record<string, PaymentGateway> = {
  [azulGateway.code]: azulGateway,
};

export function getPaymentGateway(code: string): PaymentGateway | null {
  return GATEWAYS[code] ?? null;
}
