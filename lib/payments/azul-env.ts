/**
 * AZUL Payment Page (Banco Popular) — variables de entorno.
 *
 * - `AZUL_MERCHANT_ID`: **ID de comercio** que AZUL asigna al comercio para el formulario
 *   (`MerchantId`). No es lo mismo que la “Clave” de API del portal de desarrolladores; si usas
 *   la clave como MerchantId, la pasarela responde `VALIDATION_ERROR:MerchantId`.
 * - `AZUL_SECRET_KEY` (+ opcional `AZUL_AUTH_KEY`): secreto para **AuthHash** y firma del retorno.
 * - `AZUL_CLIENT_KEY`: solo si el portal la distingue; **no** se usa como `MerchantId` salvo
 *   `AZUL_USE_CLIENT_KEY_AS_MERCHANT_ID=true` (no recomendado).
 */

export function getAzulMerchantIdentifier(): string {
  const merchantId = process.env.AZUL_MERCHANT_ID?.trim();
  if (merchantId) return merchantId;
  if (process.env.AZUL_USE_CLIENT_KEY_AS_MERCHANT_ID === "true") {
    return process.env.AZUL_CLIENT_KEY?.trim() ?? "";
  }
  return "";
}

/** Secreto para hash de solicitud y para verificar firma del POST de retorno. */
export function getAzulSigningSecret(): string {
  const secret = process.env.AZUL_SECRET_KEY?.trim();
  if (secret) return secret;
  return process.env.AZUL_AUTH_KEY?.trim() ?? "";
}
