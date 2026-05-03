import { NextResponse } from "next/server";
import {
  getOrderPaymentSnapshotByOrderNumber,
  updateOrderPaymentStatusFromGateway,
} from "@/lib/db";
import type { AzulReturnPayload } from "@/lib/payments/azul";
import {
  azulReturnedAmountMatchesOrder,
  verifyAzulResponseSignature,
} from "@/lib/payments/azul";
import {
  getAzulMerchantIdentifier,
  getAzulSigningSecret,
} from "@/lib/payments/azul-env";

function normalizePayload(formData: FormData): AzulReturnPayload {
  const payload: AzulReturnPayload = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") payload[key] = value;
  }
  return payload;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload = normalizePayload(formData);
    console.info("[AZUL] Respuesta recibida", payload);

    const merchantId = getAzulMerchantIdentifier();
    const secretKey = getAzulSigningSecret();
    if (!merchantId || !secretKey) {
      console.error("[AZUL] Configuración faltante");
      return new NextResponse(
        "Configuración de AZUL incompleta: AZUL_MERCHANT_ID + AZUL_SECRET_KEY.",
        { status: 500 },
      );
    }

    const orderNumber = payload.OrderNumber?.trim() ?? "";
    const receivedMerchantId = payload.MerchantId?.trim() ?? "";
    if (!orderNumber) {
      console.error("[AZUL] Retorno sin OrderNumber");
      return new NextResponse("OrderNumber requerido.", { status: 400 });
    }
    if (!receivedMerchantId || receivedMerchantId !== merchantId) {
      console.error("[AZUL] MerchantId inválido", {
        orderNumber,
        receivedMerchantId,
      });
      return new NextResponse("MerchantId inválido.", { status: 400 });
    }

    if (!verifyAzulResponseSignature(payload, secretKey)) {
      console.error("[AZUL] Firma inválida detectada", {
        orderNumber,
        payload,
      });
      return new NextResponse("Firma inválida.", { status: 400 });
    }

    const order = await getOrderPaymentSnapshotByOrderNumber(orderNumber);
    if (!order) {
      console.error("[AZUL] Orden no encontrada", { orderNumber });
      return new NextResponse("Orden no encontrada.", { status: 404 });
    }

    const responseCode = payload.ResponseCode?.trim() ?? "";
    if (!azulReturnedAmountMatchesOrder(payload.Amount, order.total_cents)) {
      console.error("[AZUL] Monto no coincide con orden", {
        orderId: order.id,
        receivedAmount: payload.Amount,
        totalCents: order.total_cents,
      });
      return new NextResponse("Monto no coincide con la orden.", {
        status: 400,
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ?? new URL(request.url).origin;

    if (order.payment_status === "paid") {
      console.info("[AZUL] Retorno duplicado para orden ya pagada", {
        orderId: order.id,
        responseCode,
      });
      return NextResponse.redirect(
        `${baseUrl}/pagos/exitoso?orderId=${encodeURIComponent(order.id)}`,
        {
          status: 303,
        },
      );
    }

    if (order.payment_status === "declined" && responseCode !== "00") {
      console.info("[AZUL] Retorno duplicado para orden rechazada", {
        orderId: order.id,
        responseCode,
      });
      return NextResponse.redirect(
        `${baseUrl}/pagos/rechazado?orderId=${encodeURIComponent(order.id)}&responseCode=${encodeURIComponent(responseCode || "N/A")}`,
        { status: 303 },
      );
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

    const redirectUrl = approved
      ? `${baseUrl}/pagos/exitoso?orderId=${encodeURIComponent(order.id)}`
      : `${baseUrl}/pagos/rechazado?orderId=${encodeURIComponent(order.id)}&responseCode=${encodeURIComponent(responseCode || "N/A")}`;
    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (error) {
    console.error("[AZUL] Error interno procesando retorno", error);
    return new NextResponse("Error interno procesando el retorno de pago.", {
      status: 500,
    });
  }
}
