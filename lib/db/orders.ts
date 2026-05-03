import type { Pedido, PedidoEstado } from "@/types";
import { formatDOPFromCents } from "@/lib/format-currency";

export interface OrderRow {
  id: string;
  user_id: string | null;
  session_id: string | null;
  status: string;
  shipping_name: string | null;
  total_cents: number;
  created_at: string;
}

export const statusMap: Record<string, PedidoEstado> = {
  pending: "pendiente",
  paid: "en_proceso",
  shipped: "completado",
  cancelled: "pendiente",
};

export function rowToPedido(row: OrderRow, itemsCount: number): Pedido {
  const totalFormatted = formatDOPFromCents(row.total_cents);
  return {
    id: row.id,
    cliente: row.shipping_name ?? "—",
    items: itemsCount,
    total: totalFormatted,
    estado: statusMap[row.status] ?? "pendiente",
    createdAt: new Date(row.created_at).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }),
  };
}
