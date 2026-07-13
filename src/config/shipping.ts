/**
 * Reglas de envío compartidas por carrito, checkout y el cálculo del pedido.
 *
 * No hay monto mínimo de compra: el cliente puede pedir cualquier cantidad
 * pagando su envío. Al superar el umbral, el envío pasa a costar 0.
 */

/** Subtotal (antes de cupón) a partir del cual el envío es gratis. */
export const FREE_SHIPPING_MIN_CENTS = Number(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_CENTS ?? "350000",
);

/** ¿El subtotal alcanza el envío gratis? */
export function qualifiesForFreeShipping(subtotalCents: number): boolean {
  return FREE_SHIPPING_MIN_CENTS > 0 && subtotalCents >= FREE_SHIPPING_MIN_CENTS;
}

/** Precio final del envío para un subtotal dado. */
export function resolveShippingCents(
  subtotalCents: number,
  methodPriceCents: number,
): number {
  return qualifiesForFreeShipping(subtotalCents) ? 0 : methodPriceCents;
}

/** Cuánto falta para el envío gratis (0 si ya califica o no hay umbral). */
export function remainingForFreeShipping(subtotalCents: number): number {
  if (FREE_SHIPPING_MIN_CENTS <= 0) return 0;
  return Math.max(0, FREE_SHIPPING_MIN_CENTS - subtotalCents);
}
