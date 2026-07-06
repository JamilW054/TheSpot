/**
 * AZUL Payment Page — capa de configuración centralizada.
 *
 * Único punto de lectura de credenciales/ajustes AZUL. Ningún servicio debe
 * leer `process.env.AZUL_*` directamente — todos importan
 * `getAzulPaymentPageConfig()` de aquí. Pasar de Sandbox a Producción es
 * solo cuestión de cambiar variables de entorno; el código no cambia.
 *
 * No se memoiza a nivel de módulo a propósito: cada llamada relee
 * `process.env`, lo que mantiene el módulo testeable (los tests mutan
 * `process.env` entre casos) y tolera cambios de configuración sin reiniciar
 * el proceso en local.
 */

import {
  getAzulMerchantIdentifier,
  getAzulSigningSecret,
  readAzulEnv,
} from "./azul-env";

/** `true`/`1`/`yes` (insensible a mayúsculas) → sandbox; cualquier otro valor → producción. */
function isSandboxEnabled(): boolean {
  const v = readAzulEnv("AZUL_SANDBOX").toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

// URLs oficiales del manual de Página de Pago AZUL. Ojo: el ambiente de
// pruebas NO usa Default.aspx (así aparece en la tabla de URLs de la doc y en
// el action del formulario del ejemplo oficial); producción sí.
const SANDBOX_PAYMENT_PAGE_URL = "https://pruebas.azul.com.do/PaymentPage/";
const PRODUCTION_PAYMENT_PAGE_URL =
  "https://pagos.azul.com.do/PaymentPage/Default.aspx";

/** URL del formulario hospedado de AZUL, con overrides opcionales por entorno. */
function resolvePaymentPageUrl(sandbox: boolean): string {
  const override = sandbox
    ? readAzulEnv("AZUL_SANDBOX_URL")
    : readAzulEnv("AZUL_PRODUCTION_URL");
  if (override) return override;
  return sandbox ? SANDBOX_PAYMENT_PAGE_URL : PRODUCTION_PAYMENT_PAGE_URL;
}

export interface AzulPaymentPageConfig {
  /** `true` en sandbox (AZUL_SANDBOX=true); `false` en producción. */
  sandbox: boolean;
  /** URL del formulario hospedado (PaymentPage) según el entorno. */
  paymentPageUrl: string;
  /** MerchantId numérico asignado por AZUL para el PaymentPage. */
  merchantId: string;
  merchantName: string;
  /** Valor fijo esperado por AZUL para comercio electrónico: "ECommerce". */
  merchantType: string;
  /** Código de moneda de un carácter que espera AZUL (p.ej. "$"). */
  currencyCode: string;
  /**
   * ITBIS en el mismo formato que `Amount` (últimos 2 dígitos = decimales).
   * AZUL rechaza un "0" suelto con `VALIDATION_ERROR:Itbis` — el negocio
   * exento debe enviarlo como "000" (= 0.00), igual que en su propio ejemplo.
   */
  itbisCents: string;
  /** Secreto usado para AuthHash (solicitud) y para verificar la firma (retorno). */
  secretKey: string;
}

export function getAzulPaymentPageConfig(): AzulPaymentPageConfig {
  const sandbox = isSandboxEnabled();
  return {
    sandbox,
    paymentPageUrl: resolvePaymentPageUrl(sandbox),
    merchantId: getAzulMerchantIdentifier(),
    merchantName: readAzulEnv("AZUL_MERCHANT_NAME") || "BUXXEP STORE",
    merchantType: readAzulEnv("AZUL_MERCHANT_TYPE") || "ECommerce",
    currencyCode: readAzulEnv("AZUL_CURRENCY_CODE") || "$",
    itbisCents: readAzulEnv("AZUL_ITBIS_CENTS") || "000",
    secretKey: getAzulSigningSecret(),
  };
}

export interface AzulConfigValidation {
  ok: boolean;
  /** Campos de configuración faltantes, en lenguaje humano (para logs/errores). */
  missing: string[];
}

/** Valida que la configuración mínima para firmar y redirigir esté presente. */
export function validateAzulConfig(
  config: AzulPaymentPageConfig,
): AzulConfigValidation {
  const missing: string[] = [];
  if (!config.merchantId) {
    missing.push(
      "MerchantId: define AZUL_MERCHANT_ID (numérico, no la Clave del portal)",
    );
  }
  if (!config.secretKey) {
    missing.push("Secret Key: define AZUL_SECRET_KEY (o AZUL_AUTH_KEY)");
  }
  return { ok: missing.length === 0, missing };
}
