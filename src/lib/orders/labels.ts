/**
 * Estados reales de `orders.status` (ver migración 00001) con su etiqueta y
 * tono para la UI. Fuente única para el admin (detalle, lista, reportes) y
 * para la consulta pública de estado.
 */

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export const ORDER_STATUS_HINT: Record<string, string> = {
  pending: "Recibido, falta confirmar con el cliente.",
  confirmed: "Confirmado con el cliente.",
  processing: "Se está preparando el paquete.",
  shipped: "En camino al cliente.",
  delivered: "Entregado. El stock se descuenta del inventario.",
  cancelled: "Cancelado. El stock reservado se libera.",
  refunded: "Reembolsado. El stock vuelve al inventario.",
};

export type StatusTone = "neutral" | "brand" | "success" | "warning" | "danger";

export const ORDER_STATUS_TONE: Record<string, StatusTone> = {
  pending: "warning",
  confirmed: "brand",
  processing: "brand",
  shipped: "brand",
  delivered: "success",
  cancelled: "danger",
  refunded: "neutral",
};

export function isOrderStatus(v: unknown): v is OrderStatus {
  return typeof v === "string" && (ORDER_STATUSES as readonly string[]).includes(v);
}

/**
 * Efecto de cada estado sobre el inventario de una línea con `n` unidades:
 * - abierto (pending → shipped): reserva `n` (no disponible para otros).
 * - entregado: descuenta `n` de la existencia física.
 * - cancelado/reembolsado: sin efecto (stock libre).
 */
export function inventoryEffect(
  status: string,
  n: number,
): { reserved: number; quantity: number } {
  if (status === "delivered") return { reserved: 0, quantity: -n };
  if (status === "cancelled" || status === "refunded") {
    return { reserved: 0, quantity: 0 };
  }
  return { reserved: n, quantity: 0 };
}
