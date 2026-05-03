import { getOrdersAdmin } from "@/lib/db";
import { PedidosAdminClient } from "./PedidosAdminClient";

export default async function AdminPedidosPage() {
  const pedidos = await getOrdersAdmin();
  return <PedidosAdminClient pedidos={pedidos} />;
}
