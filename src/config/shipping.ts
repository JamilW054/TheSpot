/**
 * Reglas de envío compartidas por carrito, checkout y el cálculo del pedido.
 *
 * No hay monto mínimo de compra: el cliente puede pedir cualquier cantidad
 * pagando su envío. Al superar el umbral, el envío pasa a costar 0.
 *
 * El umbral real se configura en /admin/config (`app_settings.free_shipping_min_cents`)
 * y llega al cliente por `StoreSettingsProvider`; esta constante es solo el
 * valor por defecto si aún no se ha guardado.
 */

/** Umbral por defecto (antes de cupón) a partir del cual el envío es gratis. */
export const FREE_SHIPPING_MIN_CENTS = Number(
  process.env.NEXT_PUBLIC_FREE_SHIPPING_CENTS ?? "350000",
);

/** ¿El subtotal alcanza el envío gratis? (`min` = 0 desactiva el envío gratis) */
export function qualifiesForFreeShipping(
  subtotalCents: number,
  min: number = FREE_SHIPPING_MIN_CENTS,
): boolean {
  return min > 0 && subtotalCents >= min;
}

/** Precio final del envío para un subtotal dado. */
export function resolveShippingCents(
  subtotalCents: number,
  methodPriceCents: number,
  min: number = FREE_SHIPPING_MIN_CENTS,
): number {
  return qualifiesForFreeShipping(subtotalCents, min) ? 0 : methodPriceCents;
}

/** Cuánto falta para el envío gratis (0 si ya califica o no hay umbral). */
export function remainingForFreeShipping(
  subtotalCents: number,
  min: number = FREE_SHIPPING_MIN_CENTS,
): number {
  if (min <= 0) return 0;
  return Math.max(0, min - subtotalCents);
}
