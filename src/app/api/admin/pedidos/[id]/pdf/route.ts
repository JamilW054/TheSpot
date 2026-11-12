import { NextResponse } from "next/server";
import {
  getOrderAdminDetail,
  orderToReceiptData,
} from "@/database/repositories/order-detail";
import { getStoreActor } from "@/lib/auth/store-actor";
import { renderReceiptPdf } from "@/lib/resend/pdf/receipt-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Comprobante PDF de un pedido (para imprimir o enviar al cliente). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Admin: cualquier pedido. Tienda aprobada: solo los suyos.
  const actor = await getStoreActor();
  if (!actor || (!actor.isAdmin && actor.store?.status !== "approved")) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { id } = await params;
  const order = await getOrderAdminDetail(id);
  if (!order || (!actor.isAdmin && order.storeId !== actor.store?.id)) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }
  const pdf = await renderReceiptPdf(orderToReceiptData(order));
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pedido-${order.number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
