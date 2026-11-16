import { StoreFilter } from "@/components/admin/StoreFilter";
import { getOrdersAdmin } from "@/database/repositories";
import { listStoreOptions } from "@/database/repositories/stores";
import { ORDER_STATUS_PARAM, parseOrderStatusFilter } from "@/lib/orders/status";
import { PedidosAdminClient } from "./PedidosAdminClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

/** Pedidos de todas las tiendas (soporte). Cada tienda gestiona los suyos en /panel. */
export default async function AdminPedidosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = parseOrderStatusFilter(params?.[ORDER_STATUS_PARAM]);
  const tienda = typeof params?.tienda === "string" ? params.tienda : null;
  const [pedidos, stores] = await Promise.all([
    getOrdersAdmin({ status, storeId: tienda }),
    listStoreOptions(),
  ]);
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <StoreFilter stores={stores} value={tienda} />
      </div>
      <PedidosAdminClient pedidos={pedidos} statusFilter={status} />
    </div>
  );
}
