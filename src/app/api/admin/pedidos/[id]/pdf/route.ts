import { NextResponse } from "next/server";
import {
  getOrderAdminDetail,
  orderToReceiptData,
} from "@/database/repositories/order-detail";
import { ROLE } from "@/lib/auth/roles";
import { getSessionUserWithRole } from "@/lib/auth/session-user";
import { renderReceiptPdf } from "@/lib/resend/pdf/receipt-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Comprobante PDF de un pedido (para imprimir o enviar al cliente). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionUserWithRole();
  if (!session || session.role !== ROLE.ADMIN) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const { id } = await params;
  const order = await getOrderAdminDetail(id);
  if (!order) {
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
