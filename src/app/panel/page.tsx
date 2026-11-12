import { countOrdersAdmin, getOrdersAdmin } from "@/database/repositories";
import { getAdminDashboardMetrics } from "@/database/repositories/admin-metrics";
import { StoreDashboardClient } from "@/features/panel/StoreDashboardClient";
import { requirePanelStore } from "@/lib/auth/store-actor";

export const dynamic = "force-dynamic";

/** Pedidos que se listan en "Pedidos recientes". */
const RECENT_ORDERS_LIMIT = 8;

export default async function PanelDashboardPage() {
  const { store } = await requirePanelStore();
  const [metrics, pedidosPagados, pedidosSinPagar] = await Promise.all([
    getAdminDashboardMetrics({ storeId: store.id }),
    getOrdersAdmin({
      status: "paid",
      limit: RECENT_ORDERS_LIMIT,
      storeId: store.id,
    }),
    countOrdersAdmin("pending", store.id),
  ]);
  return (
    <StoreDashboardClient
      metrics={metrics}
      recentPedidos={pedidosPagados}
      unpaidOrdersCount={pedidosSinPagar}
      storeName={store.name}
      storeSlug={store.slug}
    />
  );
}
