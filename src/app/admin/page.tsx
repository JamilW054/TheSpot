import { getOrdersAdmin } from "@/database/repositories";
import { getAdminDashboardMetrics } from "@/database/repositories/admin-metrics";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminPage() {
  const [metrics, pedidos] = await Promise.all([
    getAdminDashboardMetrics(),
    getOrdersAdmin(),
  ]);
  return (
    <AdminDashboardClient
      metrics={metrics}
      recentPedidos={pedidos.slice(0, 8)}
    />
  );
}
