/**
 * Pedido (order) domain types.
 * Core entity and estado enum for orders.
 */

export type PedidoEstado = "pendiente" | "en_proceso" | "completado";

export interface Pedido {
  id: string;
  cliente: string;
  items: number;
  total: string;
  estado: PedidoEstado;
  /** Fecha de creación para listados (ej. "22/02/24") */
  createdAt?: string;
}

/** Línea del detalle de pedido (consulta estado). */
export interface OrderStatusDetailItem {
  productName: string;
  productSlug: string;
  coverImageUrl: string;
  /** Nombre del diseño o "Diseño personalizado" si hay design_id pero sin nombre. */
  designName: string | null;
  /** Imagen del diseño personalizado (cuando aplica). */
  designCoverImageUrl: string | null;
  quantity: number;
  unitPriceCents: number;
}

/** Detalle de un pedido para consulta pública por ID (estado del pedido). */
export interface OrderStatusDetail {
  id: string;
  status: PedidoEstado;
  totalCents: number;
  createdAt: string;
  shippingName: string | null;
  items: OrderStatusDetailItem[];
}
