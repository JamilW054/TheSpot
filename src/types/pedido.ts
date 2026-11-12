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

/** Línea de producto resumida para las cards de pedidos del admin. */
export interface PedidoLineItem {
  productName: string;
  /** Imagen de portada del producto (snapshot del pedido). */
  coverImageUrl: string;
  quantity: number;
  size: string | null;
  color: string | null;
}

export interface Pedido {
  id: string;
  cliente: string;
  /** Tienda del marketplace que atiende el pedido. */
  tienda?: string | null;
  items: number;
  /** Detalle de productos del pedido (nombre + foto) para el admin. */
  lineItems: PedidoLineItem[];
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
  /** Número corto del pedido (#XXXXXXXX). */
  orderNumber?: string;
  /** Tienda que atiende el pedido (marketplace). */
  storeName?: string | null;
  storeSlug?: string | null;
  status: PedidoEstado;
  totalCents: number;
  createdAt: string;
  shippingName: string | null;
  items: OrderStatusDetailItem[];
  /** Estado del cobro: 'pending' hasta que el admin lo marca como pagado. */
  paymentStatus: OrderPaymentStatus;
  /** Fecha de confirmación de pago (orders.paid_at), si ya se cobró. */
  paidAt: string | null;
  /** Estado detallado de la BD (pending, confirmed, processing, shipped, delivered, cancelled, refunded). */
  rawStatus?: string;
  /** Método de pago legible. */
  paymentMethodLabel?: string;
  paymentMethod?: string;
  /** Cuenta elegida para transferir (snapshot del pedido). */
  bankAccount?: {
    bankName: string;
    accountType: string;
    accountNumber: string;
    holderName: string;
    holderDocument?: string | null;
    currency?: string;
    instructions?: string | null;
  } | null;
  subtotalCents?: number;
  shippingCents?: number;
  discountCents?: number;
}
