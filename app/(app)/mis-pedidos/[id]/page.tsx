import { OrderDetailView } from "@/components/order/OrderDetailView";
import { PageLayout } from "@/components/layout";
import { getOrderStatusById } from "@/lib/db";
import { getOrders } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function MisPedidosDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [orders, orderDetail] = await Promise.all([
    getOrders(),
    getOrderStatusById(id),
  ]);
  const isMine = orders.some((o) => o.id === id);
  if (!isMine || !orderDetail) notFound();
  return (
    <PageLayout title="Detalle del pedido">
      <OrderDetailView
        order={orderDetail}
        backHref="/mis-pedidos"
        backLabel="Volver a Mis pedidos"
      />
    </PageLayout>
  );
}
