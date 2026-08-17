/**
 * Estado de cobro de un pedido. JW PARFUM no cobra en línea: el pedido queda
 * `pending` hasta que el admin lo marca manualmente como `paid` tras coordinar
 * el pago por WhatsApp. Coincide con el constraint de `orders.payment_status`
 * (migración 00001): solo admite 'pending' | 'paid'.
 */
export type PaymentStatus = "pending" | "paid";

/** True si el valor almacenado representa un pedido ya cobrado. */
export function isSuccessfulPaymentStatus(
  value: string | null | undefined,
): boolean {
  return value === "paid";
}
