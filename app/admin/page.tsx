import { AdminDashboardClient } from "./AdminDashboardClient";
import { getLineas, getOrdersAdmin } from "@/lib/db";

export default async function AdminPage() {
  const [initialPedidos, initialLineas] = await Promise.all([
    getOrdersAdmin(),
    getLineas(),
  ]);
  return (
    <AdminDashboardClient
      initialPedidos={initialPedidos}
      initialLineas={initialLineas}
    />
  );
}
