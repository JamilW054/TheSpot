/**
 * AZUL Payment Page (Banco Popular) — variables de entorno.
 *
 * - `AZUL_MERCHANT_ID`: **ID de comercio** que AZUL asigna al comercio para el formulario
 *   (`MerchantId`). No es lo mismo que la “Clave” de API del portal de desarrolladores; si usas
 *   la clave como MerchantId, la pasarela responde `VALIDATION_ERROR:MerchantId`.
 * - `AZUL_SECRET_KEY` (+ opcional `AZUL_AUTH_KEY`): secreto para **AuthHash** y firma del retorno.
 * - `AZUL_CLIENT_KEY`: solo si el portal la distingue; **no** se usa como `MerchantId` salvo
 *   `AZUL_USE_CLIENT_KEY_AS_MERCHANT_ID=true` / `1` / `yes` (no recomendado).
 */

/** Lee env con trim y sin comillas envolventes (evita valores vacíos por copiar/pegar). */
export function readAzulEnv(name: string): string {
  const raw = process.env[name];
  if (raw == null) return "";
  let t = raw.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim();
  }
  return t;
}

function clientKeyMerchantFallbackEnabled(): boolean {
  const v = readAzulEnv("AZUL_USE_CLIENT_KEY_AS_MERCHANT_ID").toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function getAzulMerchantIdentifier(): string {
  const merchantId = readAzulEnv("AZUL_MERCHANT_ID");
  if (merchantId) return merchantId;
  if (clientKeyMerchantFallbackEnabled()) {
    return readAzulEnv("AZUL_CLIENT_KEY");
  }
  return "";
}

/** Secreto para hash de solicitud y para verificar firma del POST de retorno. */
export function getAzulSigningSecret(): string {
  const secret = readAzulEnv("AZUL_SECRET_KEY");
  if (secret) return secret;
  return readAzulEnv("AZUL_AUTH_KEY");
}
