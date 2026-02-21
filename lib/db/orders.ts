import type { Pedido, PedidoEstado } from "@/types";

export interface OrderRow {
  id: string;
  user_id: string | null;
  session_id: string | null;
  status: string;
  shipping_name: string | null;
  total_cents: number;
  created_at: string;
}

const statusMap: Record<string, PedidoEstado> = {
  pending: "pendiente",
  paid: "en_proceso",
  shipped: "completado",
  cancelled: "pendiente",
};

export function rowToPedido(row: OrderRow, itemsCount: number): Pedido {
  const totalFormatted = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(row.total_cents / 100);
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
