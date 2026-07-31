/**
 * Estados de pedido filtrables en el panel admin ("Todos los pedidos").
 *
 * Son los mismos estados de fulfillment que ya maneja `adminSetOrdersStatus`
 * (ver `lib/actions/orders-admin.ts`), pero restringidos a los tres que el
 * admin puede consultar. La tabla `orders` no tiene una sola columna con estos
 * valores: se derivan de `status` (order_status) + `payment_status`, y esa
 * traducción vive en `getOrdersAdmin` para que el filtro se aplique en la
 * consulta y no en memoria.
 */

export const ORDER_STATUS_FILTERS = ["paid", "pending", "cancelled"] as const;

export type OrderStatusFilter = (typeof ORDER_STATUS_FILTERS)[number];

/** Estado activo al entrar a la sección sin parámetro en la URL. */
export const DEFAULT_ORDER_STATUS_FILTER: OrderStatusFilter = "paid";

/** Parámetro de búsqueda que transporta el filtro (compartido con paginación/orden). */
export const ORDER_STATUS_PARAM = "estado";

export interface OrderStatusFilterMeta {
  /** Etiqueta del botón (ES). */
  label: string;
  /** Título del estado vacío para ese filtro. */
  emptyTitle: string;
}

export const ORDER_STATUS_FILTER_META: Record<
  OrderStatusFilter,
  OrderStatusFilterMeta
> = {
  paid: { label: "Pagados", emptyTitle: "No hay pedidos pagados" },
  pending: { label: "Pendientes", emptyTitle: "No hay pedidos pendientes" },
  cancelled: { label: "Cancelados", emptyTitle: "No hay pedidos cancelados" },
};

export function isOrderStatusFilter(
  value: unknown,
): value is OrderStatusFilter {
  return (
    typeof value === "string" &&
    (ORDER_STATUS_FILTERS as readonly string[]).includes(value)
  );
}

/** Normaliza el valor de la URL; cae al estado por defecto si no es válido. */
export function parseOrderStatusFilter(
  value: string | string[] | undefined | null,
): OrderStatusFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  return isOrderStatusFilter(raw) ? raw : DEFAULT_ORDER_STATUS_FILTER;
}

export function orderStatusFilterMeta(
  status: OrderStatusFilter,
): OrderStatusFilterMeta {
  return ORDER_STATUS_FILTER_META[status];
}
