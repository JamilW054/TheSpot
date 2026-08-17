import { getResend, RESEND_FROM as FROM } from "./client";
import { renderReceiptPdf } from "./pdf/receipt-pdf";
import {
  type CompraEmailData,
  compraEmailHtml,
  compraEmailText,
} from "./templates/compra";
import {
  type NuevoPedidoAdminEmailData,
  nuevoPedidoAdminEmailHtml,
  nuevoPedidoAdminEmailText,
} from "./templates/nuevo-pedido-admin";

export async function sendCompraEmail(to: string, data: CompraEmailData) {
  const pdfBuffer = await renderReceiptPdf(data);
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Pedido confirmado #${data.orderNumber} — JW PARFUM`,
    html: compraEmailHtml(data),
    text: compraEmailText(data),
    attachments: [
      {
        filename: `recibo-${data.orderNumber}.pdf`,
        // El SDK de Resend serializa el payload con JSON.stringify; un Buffer
        // crudo se convierte en {type:"Buffer",data:[...]} y el adjunto llega
        // vacío/corrupto. Hay que mandarlo como base64.
        content: pdfBuffer.toString("base64"),
        contentType: "application/pdf",
      },
    ],
  });
}

export async function sendNewOrderAdminEmail(
  to: string,
  data: NuevoPedidoAdminEmailData,
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `🛒 Nuevo pedido #${data.orderNumber} — JW PARFUM`,
    html: nuevoPedidoAdminEmailHtml(data),
    text: nuevoPedidoAdminEmailText(data),
  });
}

