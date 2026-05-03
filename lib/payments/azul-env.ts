/**
 * Variables de entorno AZUL alineadas con el sandbox (clave + secreto).
 *
 * - MerchantId en el POST a Payment Page: `AZUL_CLIENT_KEY` (la “Clave” del portal).
 *   Opcional `AZUL_MERCHANT_ID` si el banco te da un ID distinto.
 * - Firma AuthHash y retorno: `AZUL_SECRET_KEY` (el “Secreto”).
 *   `AZUL_AUTH_KEY` se acepta solo como alias legacy del secreto.
 */

export function getAzulMerchantIdentifier(): string {
  const explicit = process.env.AZUL_MERCHANT_ID?.trim();
  if (explicit) return explicit;
  return process.env.AZUL_CLIENT_KEY?.trim() ?? "";
}

/** Secreto para hash de solicitud y para verificar firma del POST de retorno. */
export function getAzulSigningSecret(): string {
  const secret = process.env.AZUL_SECRET_KEY?.trim();
  if (secret) return secret;
  return process.env.AZUL_AUTH_KEY?.trim() ?? "";
}
