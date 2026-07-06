import {
  getOrderPaymentSnapshotByOrderNumber,
  updateOrderPaymentStatusFromGateway,
} from "@/database/repositories";
import type { AzulReturnPayload } from "@/lib/payments/azul";
import {
  azulReturnedAmountMatchesOrder,
  pickAzulField,
  verifyAzulResponseSignature,
} from "@/lib/payments/azul";
import {
  getAzulPaymentPageConfig,
  validateAzulConfig,
} from "@/lib/payments/azul-config";

export type AzulReturnOutcome =
  | { kind: "error"; status: number; message: string }
  | { kind: "redirect"; url: string };

/**
 * Procesa el retorno (webhook) de AZUL: verifica configuración, firma,
 * comercio y monto; actualiza el estado de pago del pedido de forma
 * idempotente y decide la URL de redirección para el comprador.
 */
export async function processAzulReturn(
  payload: AzulReturnPayload,
  baseUrl: string,
): Promise<AzulReturnOutcome> {
  console.info("[AZUL] Respuesta recibida", payload);

  const config = getAzulPaymentPageConfig();
  const validation = validateAzulConfig(config);
  if (!validation.ok) {
    console.error("[AZUL] Configuración faltante", {
      missing: validation.missing,
    });
    return {
      kind: "error",
      status: 500,
      message:
        "Configuración de AZUL incompleta: AZUL_MERCHANT_ID + AZUL_SECRET_KEY.",
    };
  }
  const { merchantId, secretKey } = config;

  const orderNumber = pickAzulField(payload, "OrderNumber");
  const receivedMerchantId = pickAzulField(payload, "MerchantId");
  if (!orderNumber) {
    console.error("[AZUL] Retorno sin OrderNumber");
    return { kind: "error", status: 400, message: "OrderNumber requerido." };
  }
  // MerchantId NO forma parte de los valores de retorno documentados de la
  // Página de Pago (solo algunos canales lo incluyen) — se valida únicamente
  // si viene; la autenticidad real la garantiza la firma AuthHash.
  if (receivedMerchantId && receivedMerchantId !== merchantId) {
    console.error("[AZUL] MerchantId inválido", {
      orderNumber,
      receivedMerchantId,
    });
    return { kind: "error", status: 400, message: "MerchantId inválido." };
  }

  if (!verifyAzulResponseSignature(payload, secretKey)) {
    console.error("[AZUL] Firma inválida detectada", {
      orderNumber,
      payload,
    });
    return { kind: "error", status: 400, message: "Firma inválida." };
  }

  const order = await getOrderPaymentSnapshotByOrderNumber(orderNumber);
  if (!order) {
    console.error("[AZUL] Orden no encontrada", { orderNumber });
    return { kind: "error", status: 404, message: "Orden no encontrada." };
  }

  const responseCode = pickAzulField(payload, "ResponseCode");
  const isoCode = pickAzulField(payload, "IsoCode");
  if (
    !azulReturnedAmountMatchesOrder(
      pickAzulField(payload, "Amount"),
      order.total_cents,
    )
  ) {
    console.error("[AZUL] Monto no coincide con orden", {
      orderId: order.id,
      receivedAmount: pickAzulField(payload, "Amount"),
      totalCents: order.total_cents,
    });
    return {
      kind: "error",
      status: 400,
      message: "Monto no coincide con la orden.",
    };
  }

  // Aprobación según la doc oficial: IsoCode "00" = satisfactorio. Si el
  // canal no envió IsoCode, se cae a ResponseCode "00".
  const approved = isoCode !== "" ? isoCode === "00" : responseCode === "00";
  const displayCode = responseCode || isoCode || "N/A";

  const successUrl = `${baseUrl}/pagos/exitoso?orderId=${encodeURIComponent(order.id)}`;
  const declinedUrl = `${baseUrl}/pagos/rechazado?orderId=${encodeURIComponent(order.id)}&responseCode=${encodeURIComponent(displayCode)}`;

  if (order.payment_status === "paid") {
    console.info("[AZUL] Retorno duplicado para orden ya pagada", {
      orderId: order.id,
      responseCode,
      isoCode,
    });
    return { kind: "redirect", url: successUrl };
  }

  if (order.payment_status === "declined" && !approved) {
    console.info("[AZUL] Retorno duplicado para orden rechazada", {
      orderId: order.id,
      responseCode,
      isoCode,
    });
    return { kind: "redirect", url: declinedUrl };
  }

  const transactionId =
    pickAzulField(payload, "TxnId") ||
    pickAzulField(payload, "TransactionId") ||
    pickAzulField(payload, "AzulOrderId") ||
    null;
  const authorizationCode = pickAzulField(payload, "AuthorizationCode") || null;
  const rrn = pickAzulField(payload, "RRN") || null;

  await updateOrderPaymentStatusFromGateway({
    orderId: order.id,
    paymentStatus: approved ? "paid" : "declined",
    provider: "AZUL",
    transactionId,
    responseCode: responseCode || null,
    authorizationCode,
    rrn,
    rawResponse: payload,
  });

  console.info("[AZUL] Estado actualizado", {
    orderId: order.id,
    paymentStatus: approved ? "paid" : "declined",
    responseCode,
    transactionId,
  });

  return { kind: "redirect", url: approved ? successUrl : declinedUrl };
}
