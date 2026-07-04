import { createHash, timingSafeEqual } from "node:crypto";

/** Fields AZUL may POST to ResponsePostUrl (form-data). */
export type AzulReturnPayload = Record<string, string>;

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
 * SHA-512 firma de retorno (validación server-side).
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

  return createHash("sha512").update(plain, "utf8").digest("hex");
}

/**
 * Verifica firma de respuesta de AZUL.
 */
export function verifyAzulResponseSignature(
  payload: AzulReturnPayload,
  secretKey: string,
): boolean {
  const sigRaw = (payload.AuthHash ?? payload.Signature ?? "").trim();

  if (!sigRaw || !secretKey) {
    return false;
  }

  const expected = signAzulReturnPayload({
    orderNumber: payload.OrderNumber?.trim() ?? "",
    amount: payload.Amount?.trim() ?? "",
    authorizationCode: payload.AuthorizationCode?.trim() ?? "",
    dateTime: payload.DateTime?.trim() ?? "",
    responseCode: payload.ResponseCode?.trim() ?? "",
    isoCode: payload.ISOCode?.trim() ?? "",
    responseMessage: payload.ResponseMessage?.trim() ?? "",
    errorDescription: payload.ErrorDescription?.trim() ?? "",
    rrn: payload.RRN?.trim() ?? "",
    secretKey,
  });

  try {
    const a = Buffer.from(sigRaw.toLowerCase(), "hex");
    const b = Buffer.from(expected.toLowerCase(), "hex");

    if (a.length > 0 && a.length === b.length) {
      return timingSafeEqual(a, b);
    }
  } catch {
    return false;
  }

  return false;
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
 * UseCustomField1 +
 * CustomField1Label +
 * CustomField1Value +
 * UseCustomField2 +
 * CustomField2Label +
 * CustomField2Value +
 * AuthKey
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
    parts.useCustomField1 +
    parts.customField1Label +
    parts.customField1Value +
    parts.useCustomField2 +
    (parts.customField2Label ?? "") +
    (parts.customField2Value ?? "") +
    parts.authKey;

  return createHash("sha512").update(plain, "utf8").digest("hex");
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
