import { Resend } from "resend";

/**
 * Único punto de inicialización del SDK de Resend.
 * No instanciar `new Resend(...)` fuera de este módulo.
 */
export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY no configurado.");
  return new Resend(key);
}

export const RESEND_FROM =
  process.env.RESEND_FROM ?? "Buxxep <onboarding@resend.dev>";
