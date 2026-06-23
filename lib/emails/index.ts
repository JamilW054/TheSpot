import { Resend } from "resend";
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
import { type OtpEmailData, otpEmailHtml, otpEmailText } from "./templates/otp";
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

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY no configurado.");
  return new Resend(key);
}

const FROM = process.env.RESEND_FROM ?? "Buxxep <onboarding@resend.dev>";

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
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Pedido confirmado #${data.orderNumber} — Buxxep`,
    html: compraEmailHtml(data),
    text: compraEmailText(data),
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
