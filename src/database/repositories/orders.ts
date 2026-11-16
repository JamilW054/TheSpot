import { formatDOPFromCents } from "@/lib/format-currency";
import { formatDateTime } from "@/lib/format-date";
import { isSuccessfulPaymentStatus } from "@/lib/orders/payment-status";
import type {
  OrderPaymentStatus,
  Pedido,
  PedidoEstado,
  PedidoLineItem,
  PedidoShipping,
} from "@/types";

/** Dirección de envío almacenada como JSONB en orders.shipping_address. */
export interface ShippingAddress {
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface OrderRow {
  id: string;
  user_id: string | null;
  status: string;
  payment_status: string | null;
  total_cents: number;
  created_at: string;
  shipping_address: ShippingAddress | null;
  contact_email: string | null;
  store_id?: string | null;
  stores?: { name: string } | { name: string }[] | null;
}

/** Nombre de cliente legible a partir de la dirección de envío / email. */
export function customerNameFromOrder(
  shipping: ShippingAddress | null,
  contactEmail: string | null,
): string {
  const full = shipping?.full_name?.trim();
  if (full) return full;
  const combined = [shipping?.first_name, shipping?.last_name]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(" ");
  if (combined) return combined;
  return contactEmail?.trim() || "—";
}

/** order_status (DB) → estado de la UI. */
export const statusMap: Record<string, PedidoEstado> = {
  pending: "pendiente",
  confirmed: "en_proceso",
  processing: "en_proceso",
  shipped: "completado",
  delivered: "completado",
  cancelled: "pendiente",
  refunded: "pendiente",
};

export function dbToAppPaymentStatus(
  value: string | null | undefined,
): OrderPaymentStatus {
  if (isSuccessfulPaymentStatus(value)) return "paid";
  if (value === "failed" || value === "declined") return "declined";
  return "pending";
}

function shippingFromRow(
  sa: ShippingAddress | null,
  contactEmail: string | null,
): PedidoShipping | null {
  if (!sa && !contactEmail) return null;
  return {
    fullName: sa?.full_name ?? null,
    addressLine1: sa?.address_line1 ?? null,
    addressLine2: sa?.address_line2 ?? null,
    city: sa?.city ?? null,
    postalCode: sa?.postal_code ?? null,
    countryCode: sa?.country_code ?? null,
    phone: sa?.phone ?? null,
    email: contactEmail ?? sa?.email ?? null,
  };
}

/** Snapshot del producto almacenado en order_items.product_snapshot (JSONB). */
export interface OrderItemSnapshot {
  name?: string;
  slug?: string;
  cover_image_url?: string;
  size?: string | null;
  color?: string | null;
}

/** Fila de order_items (para construir las líneas del pedido). */
export interface OrderItemRow {
  order_id?: string;
  quantity: number;
  product_snapshot?: OrderItemSnapshot | null;
}

/** order_items row → línea de producto para las cards del admin. */
export function rowToLineItem(row: OrderItemRow): PedidoLineItem {
  const snap = row.product_snapshot ?? {};
  return {
    productName: snap.name ?? "Producto",
    coverImageUrl: snap.cover_image_url ?? "",
    quantity: row.quantity,
    size: snap.size ?? null,
    color: snap.color ?? null,
  };
}

export function rowToPedido(
  row: OrderRow,
  lineItems: PedidoLineItem[],
): Pedido {
  return {
    id: row.id,
    cliente: customerNameFromOrder(row.shipping_address, row.contact_email),
    tienda: (Array.isArray(row.stores) ? row.stores[0]?.name : row.stores?.name) ?? null,
    items: lineItems.reduce((sum, li) => sum + li.quantity, 0),
    lineItems,
    total: formatDOPFromCents(row.total_cents),
    totalCents: row.total_cents,
    estado: statusMap[row.status] ?? "pendiente",
    paymentStatus: dbToAppPaymentStatus(row.payment_status),
    createdAt: formatDateTime(row.created_at, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    shipping: shippingFromRow(row.shipping_address, row.contact_email),
  };
}
