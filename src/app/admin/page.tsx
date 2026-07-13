import { getOrdersAdmin } from "@/database/repositories";
import {
  getAdminDashboardMetrics,
  getMonthlyCommissionSummary,
} from "@/database/repositories/admin-metrics";
import { getActivePartnersCurrentStatement } from "@/database/repositories/partners";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminPage() {
  const [metrics, pedidos, commissions, partners] = await Promise.all([
    getAdminDashboardMetrics(),
    getOrdersAdmin(),
    getMonthlyCommissionSummary(),
    getActivePartnersCurrentStatement(),
  ]);
  return (
    <AdminDashboardClient
      metrics={metrics}
      recentPedidos={pedidos.slice(0, 8)}
      commissions={commissions}
      partners={partners}
    />
  );
}
