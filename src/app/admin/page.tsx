import { getOrdersAdmin } from "@/database/repositories";
import {
  getAdminDashboardMetrics,
  getMonthlyCommissionSummary,
} from "@/database/repositories/admin-metrics";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminPage() {
  const [metrics, pedidos, commissions] = await Promise.all([
    getAdminDashboardMetrics(),
    getOrdersAdmin(),
    getMonthlyCommissionSummary(),
  ]);
  return (
    <AdminDashboardClient
      metrics={metrics}
      recentPedidos={pedidos.slice(0, 8)}
      commissions={commissions}
    />
  );
}
