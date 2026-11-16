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
    subject: `Pedido confirmado #${data.orderNumber} — The Spot`,
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
    subject: `🛒 Nuevo pedido #${data.orderNumber} — The Spot`,
    html: nuevoPedidoAdminEmailHtml(data),
    text: nuevoPedidoAdminEmailText(data),
  });
}


/** Envía un correo simple (plantillas de tiendas). Nunca lanza: registra y sigue. */
export async function sendSimpleEmail(
  to: string | null | undefined,
  email: { subject: string; html: string; text: string },
): Promise<void> {
  const dest = to?.trim();
  if (!dest || !process.env.RESEND_API_KEY) return;
  try {
    await getResend().emails.send({
      from: FROM,
      to: dest,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
  } catch (e) {
    console.error("[resend] no se pudo enviar:", e instanceof Error ? e.message : e);
  }
}
