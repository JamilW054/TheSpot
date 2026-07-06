import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Fields AZUL may POST to ResponsePostUrl (form-data). */
export type AzulReturnPayload = Record<string, string>;

/**
 * Busca un campo del retorno tolerando variaciones de mayúsculas — la
 * documentación de AZUL mezcla `IsoCode`/`ISOCode`/`ISO CODE` según el canal
 * y la versión, así que nunca dependemos del casing exacto.
 */
export function pickAzulField(
  payload: AzulReturnPayload,
  name: string,
): string {
  const direct = payload[name];
  if (typeof direct === "string") return direct.trim();
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(payload)) {
    if (key.toLowerCase() === lower && typeof value === "string") {
      return value.trim();
    }
  }
  return "";
}

/**
 * Razones legibles para los códigos de rechazo más comunes de AZUL (ISO 8583).
 * No pretende ser exhaustivo — es un apoyo para la página de rechazo; el
 * código exacto siempre se muestra también para soporte/depuración.
 */
const AZUL_DECLINE_REASONS: Record<string, string> = {
  "05": "El banco emisor rechazó la transacción (no honrada).",
  "51": "Fondos insuficientes en la tarjeta.",
  "54": "La tarjeta está vencida.",
  "14": "Número de tarjeta inválido.",
  "61": "Excede el límite de retiro/compra de la tarjeta.",
  "62": "Tarjeta restringida.",
  "65": "Excede el límite de transacciones permitidas.",
  "78": "Tarjeta no activada o bloqueada por el banco.",
  N7: "Código de seguridad (CVV) incorrecto.",
};

/** Mensaje legible para un código de respuesta de AZUL; genérico si es desconocido. */
export function getAzulDeclineReason(
  responseCode: string | null | undefined,
): string {
  const code = responseCode?.trim().toUpperCase() ?? "";
  return (
    AZUL_DECLINE_REASONS[code] ??
    "El banco no aprobó la transacción. Puede deberse a fondos insuficientes, restricciones de seguridad o una validación fallida."
  );
}

/**
 * Convierte pesos a formato AZUL.
 *
 * RD$ 10.00 => "1000"
 * RD$ 150.75 => "15075"
 * RD$ 0 => "0"
 */
export function toAzulAmount(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error("Invalid amount");
  }

  return Math.round(value * 100).toString();
}

/**
 * HMAC-SHA512 de la firma de retorno (validación server-side).
 *
 * AZUL firma con `hash_hmac('sha512', mensaje, AuthKey)` — NO un SHA-512
 * plano del mensaje. El secreto va dos veces: una vez concatenado al final
 * del mensaje (igual que en el ejemplo oficial de AZUL) y otra vez como
 * clave del HMAC. Verificado byte a byte contra el AuthHash de ejemplo de
 * dev.azul.com.do.
 *
 * Documentación oficial:
 * OrderNumber + Amount + AuthorizationCode + DateTime +
 * ResponseCode + ISOCode + ResponseMessage +
 * ErrorDescription + RRN + AuthKey
 *
 * Fuente:
 * https://dev.azul.com.do/
 */
export function signAzulReturnPayload(input: {
  orderNumber: string;
  amount: string;
  authorizationCode: string;
  dateTime: string;
  responseCode: string;
  isoCode: string;
  responseMessage: string;
  errorDescription: string;
  rrn: string;
  secretKey: string;
}): string {
  const plain =
    input.orderNumber +
    input.amount +
    input.authorizationCode +
    input.dateTime +
    input.responseCode +
    input.isoCode +
    input.responseMessage +
    input.errorDescription +
    input.rrn +
    input.secretKey;

  return createHmac("sha512", input.secretKey)
    .update(plain, "utf8")
    .digest("hex");
}

/**
 * Firmas candidatas del retorno. AZUL varía el esquema según versión/canal:
 *
 * 1. HMAC-SHA512 sobre bytes UTF-16LE del mensaje, clave UTF-8 — **este es
 *    el que produce el sandbox real hoy** (verificado byte a byte contra un
 *    AuthHash de respuesta real del 2026-07-05).
 * 2. HMAC-SHA512 sobre bytes UTF-8 (mismo esquema que la firma de solicitud).
 * 3. SHA-512 plano sobre UTF-16LE (snippet PHP `calculateAuthHashResponse`
 *    de la doc oficial: `mb_convert_encoding(...,'UTF-16LE')` + `hash()`).
 *
 * Los tres requieren conocer la AuthKey secreta, así que aceptar cualquiera
 * mantiene la misma garantía de autenticidad.
 */
function candidateReturnSignatures(
  input: Parameters<typeof signAzulReturnPayload>[0],
): string[] {
  const plain =
    input.orderNumber +
    input.amount +
    input.authorizationCode +
    input.dateTime +
    input.responseCode +
    input.isoCode +
    input.responseMessage +
    input.errorDescription +
    input.rrn +
    input.secretKey;

  return [
    createHmac("sha512", input.secretKey)
      .update(Buffer.from(plain, "utf16le"))
      .digest("hex"),
    createHmac("sha512", input.secretKey).update(plain, "utf8").digest("hex"),
    createHash("sha512").update(Buffer.from(plain, "utf16le")).digest("hex"),
  ];
}

function hashesMatch(receivedHex: string, expectedHex: string): boolean {
  try {
    const a = Buffer.from(receivedHex.toLowerCase(), "hex");
    const b = Buffer.from(expectedHex.toLowerCase(), "hex");
    return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Verifica firma de respuesta de AZUL. Acepta cualquiera de los dos esquemas
 * que AZUL documenta (HMAC-SHA512 utf8, o SHA-512 plano sobre UTF-16LE) —
 * ambos requieren conocer la AuthKey secreta, así que la garantía de
 * autenticidad es equivalente.
 */
export function verifyAzulResponseSignature(
  payload: AzulReturnPayload,
  secretKey: string,
): boolean {
  const sigRaw =
    pickAzulField(payload, "AuthHash") || pickAzulField(payload, "Signature");

  if (!sigRaw || !secretKey) {
    return false;
  }

  const input = {
    orderNumber: pickAzulField(payload, "OrderNumber"),
    amount: pickAzulField(payload, "Amount"),
    authorizationCode: pickAzulField(payload, "AuthorizationCode"),
    dateTime: pickAzulField(payload, "DateTime"),
    responseCode: pickAzulField(payload, "ResponseCode"),
    isoCode: pickAzulField(payload, "IsoCode"),
    responseMessage: pickAzulField(payload, "ResponseMessage"),
    errorDescription: pickAzulField(payload, "ErrorDescription"),
    rrn: pickAzulField(payload, "RRN"),
    secretKey,
  };

  return candidateReturnSignatures(input).some((candidate) =>
    hashesMatch(sigRaw, candidate),
  );
}

/**
 * Verifica si el monto retornado por AZUL coincide.
 *
 * totalCents:
 * 15075 => RD$150.75
 */
export function azulReturnedAmountMatchesOrder(
  amountRaw: string | undefined,
  totalCents: number,
): boolean {
  const raw = amountRaw?.trim() ?? "";

  if (!raw) {
    return false;
  }

  const parsed = Number.parseInt(raw, 10);

  if (Number.isNaN(parsed)) {
    return false;
  }

  return parsed === totalCents;
}

/**
 * Genera AuthHash para PaymentPage.
 *
 * AZUL firma con `hash_hmac('sha512', mensaje, AuthKey)` (HMAC-SHA512), no un
 * SHA-512 plano — verificado byte a byte contra el AuthHash del ejemplo
 * oficial de dev.azul.com.do (MerchantId 39038540035 / "Prueba AZUL").
 *
 * Orden oficial:
 * MerchantId +
 * MerchantName +
 * MerchantType +
 * CurrencyCode +
 * OrderNumber +
 * Amount +
 * ITBIS +
 * ApprovedUrl +
 * DeclinedUrl +
 * CancelUrl +
 * [ResponsePostUrl] +   ← solo si se envía el campo en el POST
 * UseCustomField1 +
 * CustomField1Label +
 * CustomField1Value +
 * UseCustomField2 +
 * CustomField2Label +
 * CustomField2Value +
 * AuthKey
 *
 * `ResponsePostUrl` no aparece en el manual vigente de Página de Pago, pero
 * el sandbox lo soporta y — verificado empíricamente contra
 * pruebas.azul.com.do — SI se envía, Azul lo incluye en su cálculo del hash
 * justo después de CancelUrl. Enviarlo sin hashearlo (o hashearlo en otra
 * posición) produce INVALID_AUTH:AuthHash.
 *
 * Docs:
 * https://dev.azul.com.do/
 */
export function buildAzulRequestAuthHash(parts: {
  merchantId: string;
  merchantName: string;
  merchantType: string;
  currencyCode: string;
  orderNumber: string;
  amount: string;
  ITBIS: string;

  approvedUrl: string;
  declinedUrl: string;
  cancelUrl: string;
  /** Solo si el POST incluye ResponsePostUrl; se hashea tras CancelUrl. */
  responsePostUrl?: string;

  useCustomField1: string;
  customField1Label: string;
  customField1Value: string;

  useCustomField2: string;
  customField2Label?: string;
  customField2Value?: string;

  authKey: string;
}): string {
  const plain =
    parts.merchantId +
    parts.merchantName +
    parts.merchantType +
    parts.currencyCode +
    parts.orderNumber +
    parts.amount +
    parts.ITBIS +
    parts.approvedUrl +
    parts.declinedUrl +
    parts.cancelUrl +
    (parts.responsePostUrl ?? "") +
    parts.useCustomField1 +
    parts.customField1Label +
    parts.customField1Value +
    parts.useCustomField2 +
    (parts.customField2Label ?? "") +
    (parts.customField2Value ?? "") +
    parts.authKey;

  return createHmac("sha512", parts.authKey)
    .update(plain, "utf8")
    .digest("hex");
}

/**
 * Escapa HTML para inputs hidden.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Helper completo para construir payload.
 */
export function buildAzulPaymentPayload(input: {
  merchantId: string;
  merchantName: string;
  merchantType: string;
  currencyCode: string;

  orderNumber: string;

  total: number;
  itbis: number;

  approvedUrl: string;
  declinedUrl: string;
  cancelUrl: string;

  authKey: string;
}) {
  const amount = toAzulAmount(input.total);
  const ITBIS = toAzulAmount(input.itbis);

  const payload = {
    MerchantId: input.merchantId,
    MerchantName: input.merchantName,
    MerchantType: input.merchantType,
    CurrencyCode: input.currencyCode,

    OrderNumber: input.orderNumber,

    Amount: amount,
    ITBIS,

    ApprovedUrl: input.approvedUrl,
    DeclinedUrl: input.declinedUrl,
    CancelUrl: input.cancelUrl,

    UseCustomField1: "1",
    CustomField1Label: "orderId",
    CustomField1Value: input.orderNumber,

    UseCustomField2: "0",
    CustomField2Label: "",
    CustomField2Value: "",
  };

  const authHash = buildAzulRequestAuthHash({
    merchantId: payload.MerchantId,
    merchantName: payload.MerchantName,
    merchantType: payload.MerchantType,
    currencyCode: payload.CurrencyCode,

    orderNumber: payload.OrderNumber,

    amount: payload.Amount,
    ITBIS: payload.ITBIS,

    approvedUrl: payload.ApprovedUrl,
    declinedUrl: payload.DeclinedUrl,
    cancelUrl: payload.CancelUrl,

    useCustomField1: payload.UseCustomField1,
    customField1Label: payload.CustomField1Label,
    customField1Value: payload.CustomField1Value,

    useCustomField2: payload.UseCustomField2,
    customField2Label: payload.CustomField2Label,
    customField2Value: payload.CustomField2Value,

    authKey: input.authKey,
  });

  return {
    ...payload,
    AuthHash: authHash,
  };
}
