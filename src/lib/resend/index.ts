import { getResend, RESEND_FROM as FROM } from "./client";
import { renderReceiptPdf } from "./pdf/receipt-pdf";
import {
  type BienvenidaEmailData,
  bienvenidaEmailHtml,
  bienvenidaEmailText,
} from "./templates/bienvenida";
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
import { type OtpEmailData, otpEmailHtml, otpEmailText } from "./templates/otp";
import {
  type PaymentConfirmedEmailData,
  paymentConfirmedEmailHtml,
  paymentConfirmedEmailText,
} from "./templates/payment-confirmed";
import {
  type PaymentLinkEmailData,
  paymentLinkEmailHtml,
  paymentLinkEmailText,
} from "./templates/payment-link";
import {
  type ResetPasswordEmailData,
  resetPasswordEmailHtml,
  resetPasswordEmailText,
} from "./templates/reset-password";

export async function sendOtpEmail(to: string, data: OtpEmailData) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `${data.code} — Tu código de verificación Buxxep`,
    html: otpEmailHtml(data),
    text: otpEmailText(data),
  });
}

export async function sendBienvenidaEmail(
  to: string,
  data: BienvenidaEmailData,
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "¡Bienvenido a Buxxep! 🎨",
    html: bienvenidaEmailHtml(data),
    text: bienvenidaEmailText(data),
  });
}

export async function sendCompraEmail(to: string, data: CompraEmailData) {
  const pdfBuffer = await renderReceiptPdf(data);
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Pedido confirmado #${data.orderNumber} — Buxxep`,
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
    subject: `🛒 Nuevo pedido #${data.orderNumber} — Buxxep`,
    html: nuevoPedidoAdminEmailHtml(data),
    text: nuevoPedidoAdminEmailText(data),
  });
}

export async function sendPaymentLinkEmail(
  to: string,
  data: PaymentLinkEmailData,
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Solicitud de pago disponible — Buxxep",
    html: paymentLinkEmailHtml(data),
    text: paymentLinkEmailText(data),
  });
}

export async function sendPaymentConfirmedEmail(
  to: string,
  data: PaymentConfirmedEmailData,
) {
  // Solicitudes de pago manuales (sin pedido) no tienen líneas de producto;
  // el recibo se genera con una sola línea que representa el pago, con el
  // mismo layout que el recibo de compra (ver receipt-document.tsx).
  const pdfBuffer = await renderReceiptPdf({
    name: data.name,
    orderId: data.referenceNumber,
    orderNumber: data.referenceNumber,
    items: [
      {
        name: data.description ?? "Pago",
        quantity: 1,
        unitPrice: data.amountCents,
      },
    ],
    subtotal: data.amountCents,
    shipping: 0,
    tax: 0,
    total: data.amountCents,
    currency: data.currency,
    purchaseDate: data.paidAtLabel ?? undefined,
    paymentMethodLabel: data.methodLabel,
    paymentStatusLabel: "Pagado",
  });
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Pago confirmado (${data.referenceNumber}) — Buxxep`,
    html: paymentConfirmedEmailHtml(data),
    text: paymentConfirmedEmailText(data),
    attachments: [
      {
        filename: `recibo-${data.referenceNumber}.pdf`,
        content: pdfBuffer.toString("base64"),
        contentType: "application/pdf",
      },
    ],
  });
}

export async function sendResetPasswordEmail(
  to: string,
  data: ResetPasswordEmailData,
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: "Restablece tu contraseña — Buxxep",
    html: resetPasswordEmailHtml(data),
    text: resetPasswordEmailText(data),
  });
}
