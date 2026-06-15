import { formatDOPFromCents } from "@/lib/format-currency";
import type { Pedido, PedidoEstado } from "@/types";

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
  total_cents: number;
  created_at: string;
  shipping_address: ShippingAddress | null;
  contact_email: string | null;
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

export function rowToPedido(row: OrderRow, itemsCount: number): Pedido {
  return {
    id: row.id,
    cliente: customerNameFromOrder(row.shipping_address, row.contact_email),
    items: itemsCount,
    total: formatDOPFromCents(row.total_cents),
    estado: statusMap[row.status] ?? "pendiente",
    createdAt: new Date(row.created_at).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }),
  };
}
