import { createHash, timingSafeEqual } from "node:crypto";

/** Fields AZUL may POST to ResponsePostUrl (form-data). */
export type AzulReturnPayload = Record<string, string>;

/**
 * SHA-512 firma de retorno (validación server-side).
 * Orden de concatenación alineada con la integración Buxxep → AZUL POST retorno.
 */
export function signAzulReturnPayload(input: {
  orderNumber: string;
  amount: string;
  merchantId: string;
  responseCode: string;
  authorizationCode: string;
  rrn: string;
  secretKey: string;
}): string {
  const plain =
    input.orderNumber +
    input.amount +
    input.merchantId +
    input.responseCode +
    input.authorizationCode +
    input.rrn +
    input.secretKey;
  return createHash("sha512").update(plain, "utf8").digest("hex");
}

export function verifyAzulResponseSignature(
  payload: AzulReturnPayload,
  secretKey: string,
): boolean {
  const sigRaw = (payload.Signature ?? payload.AuthHash ?? "").trim();
  if (!sigRaw || !secretKey) return false;
  const expected = signAzulReturnPayload({
    orderNumber: payload.OrderNumber?.trim() ?? "",
    amount: payload.Amount?.trim() ?? "",
    merchantId: payload.MerchantId?.trim() ?? "",
    responseCode: payload.ResponseCode?.trim() ?? "",
    authorizationCode: payload.AuthorizationCode?.trim() ?? "",
    rrn: payload.RRN?.trim() ?? "",
    secretKey,
  });
  try {
    const a = Buffer.from(sigRaw.toLowerCase(), "hex");
    const b = Buffer.from(expected.toLowerCase(), "hex");
    if (a.length === b.length && a.length > 0) return timingSafeEqual(a, b);
  } catch {
    /* fall through */
  }
  return sigRaw.toLowerCase() === expected.toLowerCase();
}

/** Monto en pesos con 2 decimales ("2450.00") para comparar retorno vs orden. */
export function toAzulAmount(pesoUnits: number): string {
  return pesoUnits.toFixed(2);
}

/**
 * AZUL puede enviar Amount como decimal ("2450.00") o como entero sin punto ("245000" = centavos).
 */
export function azulReturnedAmountMatchesOrder(
  amountRaw: string | undefined,
  totalCents: number,
): boolean {
  const raw = amountRaw?.trim() ?? "";
  if (!raw) return false;
  if (raw.includes(".") || raw.includes(",")) {
    const normalized = raw.replace(",", "");
    const pesos = Number.parseFloat(normalized);
    if (Number.isNaN(pesos)) return false;
    return toAzulAmount(pesos) === toAzulAmount(totalCents / 100);
  }
  const asInt = Number.parseInt(raw, 10);
  if (Number.isNaN(asInt)) return false;
  return asInt === totalCents;
}

/** AuthHash para solicitud a PaymentPage (SHA-512, orden fijo AZUL). */
export function buildAzulRequestAuthHash(parts: {
  merchantId: string;
  merchantName: string;
  merchantType: string;
  currencyCode: string;
  orderNumber: string;
  amount: string;
  itbis: string;
  approvedUrl: string;
  declinedUrl: string;
  cancelUrl: string;
  useCustomField1: string;
  customField1Label: string;
  customField1Value: string;
  useCustomField2: string;
  authKey: string;
}): string {
  const plain =
    parts.merchantId +
    parts.merchantName +
    parts.merchantType +
    parts.currencyCode +
    parts.orderNumber +
    parts.amount +
    parts.itbis +
    parts.approvedUrl +
    parts.declinedUrl +
    parts.cancelUrl +
    parts.approvedUrl +
    parts.useCustomField1 +
    parts.customField1Label +
    parts.customField1Value +
    parts.useCustomField2 +
    parts.authKey;
  return createHash("sha512").update(plain, "utf8").digest("hex");
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
