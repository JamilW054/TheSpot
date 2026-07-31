import { getOrdersAdmin } from "@/database/repositories";
import {
  ORDER_STATUS_PARAM,
  parseOrderStatusFilter,
} from "@/lib/orders/status";
import { PedidosAdminClient } from "./PedidosAdminClient";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPedidosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  // Sin parámetro en la URL el filtro por defecto es "paid": la primera
  // consulta ya vuelve solo con pedidos pagados.
  const status = parseOrderStatusFilter(params?.[ORDER_STATUS_PARAM]);
  const pedidos = await getOrdersAdmin({ status });
  return <PedidosAdminClient pedidos={pedidos} statusFilter={status} />;
}
