import { notFound } from "next/navigation";
import { OrderDetailClient } from "@/app/admin/pedidos/[id]/OrderDetailClient";
import { getOrderAdminDetail } from "@/database/repositories/order-detail";
import { requirePanelStore } from "@/lib/auth/store-actor";

export const dynamic = "force-dynamic";

export default async function PanelOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { store } = await requirePanelStore();
  const { id } = await params;
  const order = await getOrderAdminDetail(id);
  // Un pedido de otra tienda responde igual que uno inexistente.
  if (!order || order.storeId !== store.id) notFound();
  return <OrderDetailClient order={order} />;
}
