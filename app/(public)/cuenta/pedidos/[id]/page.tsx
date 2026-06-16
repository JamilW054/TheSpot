import { notFound } from "next/navigation";
import { getOrders, getOrderStatusById } from "@/lib/db";
import { OrderDetailView } from "@/components/order/OrderDetailView";

export const dynamic = "force-dynamic";

export default async function PedidoDetailPage({
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
    <article className="w-full max-w-2xl px-4 sm:px-6 pb-20 pt-6">
      <OrderDetailView
        order={orderDetail}
        backHref="/cuenta/pedidos"
        backLabel="Mis pedidos"
      />
    </article>
  );
}
