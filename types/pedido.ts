/**
 * Pedido (order) domain types.
 * Core entity and estado enum for orders.
 */

export type PedidoEstado = "pendiente" | "en_proceso" | "completado";

export interface PedidoShipping {
  fullName?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface Pedido {
  id: string;
  cliente: string;
  items: number;
  total: string;
  totalCents: number;
  estado: PedidoEstado;
  paymentStatus: OrderPaymentStatus;
  createdAt?: string;
  shipping: PedidoShipping | null;
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
  /** Talla elegida (snapshot del pedido), si aplica. */
  size: string | null;
  /** Color elegido (snapshot del pedido), si aplica. */
  color: string | null;
}

export type OrderPaymentStatus = "pending" | "paid" | "declined";

/** Detalle de un pedido para consulta pública por ID (estado del pedido). */
export interface OrderStatusDetail {
  id: string;
  status: PedidoEstado;
  totalCents: number;
  createdAt: string;
  shippingName: string | null;
  items: OrderStatusDetailItem[];
  /** Estado del cobro en pasarela (AZUL). */
  paymentStatus: OrderPaymentStatus;
  paymentProvider: string | null;
  paidAt: string | null;
  azulTransactionId: string | null;
  azulAuthorizationCode: string | null;
  azulResponseCode: string | null;
}
