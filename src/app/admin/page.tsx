import { countOrdersAdmin, getOrdersAdmin } from "@/database/repositories";
import {
  getAdminDashboardMetrics,
  getMonthlyCommissionSummary,
} from "@/database/repositories/admin-metrics";
import { getActivePartnersCurrentStatement } from "@/database/repositories/partners";
import { AdminDashboardClient } from "./AdminDashboardClient";

/** Pedidos que se listan en "Pedidos recientes". */
const RECENT_ORDERS_LIMIT = 8;

export default async function AdminPage() {
  const [metrics, pedidosPagados, pedidosSinPagar, commissions, partners] =
    await Promise.all([
      getAdminDashboardMetrics(),
      // El resumen solo muestra pedidos pagados; los que faltan por cobrar se
      // consultan en /admin/pedidos con el filtro correspondiente.
      getOrdersAdmin({ status: "paid", limit: RECENT_ORDERS_LIMIT }),
      countOrdersAdmin("pending"),
      getMonthlyCommissionSummary(),
      getActivePartnersCurrentStatement(),
    ]);
  return (
    <AdminDashboardClient
      metrics={metrics}
      recentPedidos={pedidosPagados}
      unpaidOrdersCount={pedidosSinPagar}
      commissions={commissions}
      partners={partners}
    />
  );
}
