import { PedidosAdminClient } from "@/app/admin/pedidos/PedidosAdminClient";
import { getOrdersAdmin } from "@/database/repositories";
import { requirePanelStore } from "@/lib/auth/store-actor";
import {
  ORDER_STATUS_PARAM,
  parseOrderStatusFilter,
} from "@/lib/orders/status";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PanelPedidosPage({ searchParams }: PageProps) {
  const { store } = await requirePanelStore();
  const params = await searchParams;
  const status = parseOrderStatusFilter(params?.[ORDER_STATUS_PARAM]);
  const pedidos = await getOrdersAdmin({ status, storeId: store.id });
  return <PedidosAdminClient pedidos={pedidos} statusFilter={status} />;
}
