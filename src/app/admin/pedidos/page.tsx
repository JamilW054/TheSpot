import { getOrdersAdmin } from "@/database/repositories";
import { PedidosAdminClient } from "./PedidosAdminClient";

export default async function AdminPedidosPage() {
  const pedidos = await getOrdersAdmin();
  return <PedidosAdminClient pedidos={pedidos} />;
}
