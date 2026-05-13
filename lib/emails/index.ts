import { Resend } from "resend";
import {
  bienvenidaEmailHtml,
  bienvenidaEmailText,
  type BienvenidaEmailData,
} from "./templates/bienvenida";
import {
  compraEmailHtml,
  compraEmailText,
  type CompraEmailData,
} from "./templates/compra";
import {
  otpEmailHtml,
  otpEmailText,
  type OtpEmailData,
} from "./templates/otp";
import {
  resetPasswordEmailHtml,
  resetPasswordEmailText,
  type ResetPasswordEmailData,
} from "./templates/reset-password";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY no configurado.");
  return new Resend(key);
}

const FROM = process.env.RESEND_FROM ?? "Buxxep <noreply@buxxep.vercel.app>";

export async function sendOtpEmail(to: string, data: OtpEmailData) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${data.code} — Tu código de verificación Buxxep`,
    html: otpEmailHtml(data),
    text: otpEmailText(data),
  });
}

export async function sendBienvenidaEmail(to: string, data: BienvenidaEmailData) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to,
    subject: "¡Bienvenido a Buxxep! 🎨",
    html: bienvenidaEmailHtml(data),
    text: bienvenidaEmailText(data),
  });
}

export async function sendCompraEmail(to: string, data: CompraEmailData) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Pedido confirmado #${data.orderNumber} — Buxxep`,
    html: compraEmailHtml(data),
    text: compraEmailText(data),
  });
}

export async function sendResetPasswordEmail(to: string, data: ResetPasswordEmailData) {
  const resend = getResend();
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Restablece tu contraseña — Buxxep",
    html: resetPasswordEmailHtml(data),
    text: resetPasswordEmailText(data),
  });
}
