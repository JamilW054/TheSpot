import { notFound } from "next/navigation";
import { getOrderAdminDetail } from "@/database/repositories/order-detail";
import { OrderDetailClient } from "./OrderDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderAdminDetail(id);
  if (!order) notFound();
  return <OrderDetailClient order={order} />;
}
