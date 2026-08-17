/**
 * URL base del sitio para los correos (logo, enlaces de pie, CTAs).
 * Centralizada aquí para que cambiar el dominio sea solo tocar el `.env`.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://jwparfum.com";
