import {
  getOrderPaymentSnapshotByOrderNumber,
  updateOrderPaymentStatusFromGateway,
} from "@/database/repositories";
import type { AzulReturnPayload } from "@/lib/payments/azul";
import {
  azulReturnedAmountMatchesOrder,
  verifyAzulResponseSignature,
} from "@/lib/payments/azul";
import {
  getAzulMerchantIdentifier,
  getAzulSigningSecret,
} from "@/lib/payments/azul-env";

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

  const merchantId = getAzulMerchantIdentifier();
  const secretKey = getAzulSigningSecret();
  if (!merchantId || !secretKey) {
    console.error("[AZUL] Configuración faltante");
    return {
      kind: "error",
      status: 500,
      message:
        "Configuración de AZUL incompleta: AZUL_MERCHANT_ID + AZUL_SECRET_KEY.",
    };
  }

  const orderNumber = payload.OrderNumber?.trim() ?? "";
  const receivedMerchantId = payload.MerchantId?.trim() ?? "";
  if (!orderNumber) {
    console.error("[AZUL] Retorno sin OrderNumber");
    return { kind: "error", status: 400, message: "OrderNumber requerido." };
  }
  if (!receivedMerchantId || receivedMerchantId !== merchantId) {
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

  const responseCode = payload.ResponseCode?.trim() ?? "";
  if (!azulReturnedAmountMatchesOrder(payload.Amount, order.total_cents)) {
    console.error("[AZUL] Monto no coincide con orden", {
      orderId: order.id,
      receivedAmount: payload.Amount,
      totalCents: order.total_cents,
    });
    return {
      kind: "error",
      status: 400,
      message: "Monto no coincide con la orden.",
    };
  }

  const successUrl = `${baseUrl}/pagos/exitoso?orderId=${encodeURIComponent(order.id)}`;
  const declinedUrl = `${baseUrl}/pagos/rechazado?orderId=${encodeURIComponent(order.id)}&responseCode=${encodeURIComponent(responseCode || "N/A")}`;

  if (order.payment_status === "paid") {
    console.info("[AZUL] Retorno duplicado para orden ya pagada", {
      orderId: order.id,
      responseCode,
    });
    return { kind: "redirect", url: successUrl };
  }

  if (order.payment_status === "declined" && responseCode !== "00") {
    console.info("[AZUL] Retorno duplicado para orden rechazada", {
      orderId: order.id,
      responseCode,
    });
    return { kind: "redirect", url: declinedUrl };
  }

  const transactionId =
    payload.TxnId?.trim() || payload.TransactionId?.trim() || null;
  const authorizationCode = payload.AuthorizationCode?.trim() ?? null;
  const rrn = payload.RRN?.trim() ?? null;
  const approved = responseCode === "00";

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
