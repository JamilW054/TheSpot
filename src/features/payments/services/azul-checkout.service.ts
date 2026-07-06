import {
  getOrderPaymentInfoForUser,
  markOrderAsAzulPayment,
} from "@/database/repositories";
import { buildAzulRequestAuthHash, escapeHtml } from "@/lib/payments/azul";
import {
  getAzulPaymentPageConfig,
  validateAzulConfig,
} from "@/lib/payments/azul-config";
import type {
  PaymentGateway,
  PaymentGatewayRedirectInput,
  PaymentGatewayRedirectResult,
} from "@/lib/payments/gateway";
import { createClient } from "@/lib/supabase/server";

export type AzulCheckoutResult = PaymentGatewayRedirectResult;

/**
 * Valida sesión y pedido, marca el pedido como pago AZUL y construye el HTML
 * que auto-envía el formulario firmado a la página de pago de AZUL.
 */
export async function prepareAzulPaymentRedirect(params: {
  orderId: string;
  baseUrl: string;
}): Promise<AzulCheckoutResult> {
  const { orderId, baseUrl } = params;
  const config = getAzulPaymentPageConfig();
  const validation = validateAzulConfig(config);

  if (!validation.ok) {
    console.error(
      "[AZUL] Configuración incompleta al crear solicitud de pago",
      {
        orderId,
        missing: validation.missing,
      },
    );
    return {
      ok: false,
      status: 500,
      message: `Config AZUL incompleta (${validation.missing.join("; ")}). En local: revisa .env y reinicia el dev server. En Vercel/hosting: añade las mismas variables en Project Settings → Environment Variables.`,
    };
  }

  if (!orderId) {
    return { ok: false, status: 400, message: "orderId requerido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, status: 401, message: "No autorizado." };
  }

  const order = await getOrderPaymentInfoForUser(orderId, user.id);
  if (!order) {
    console.warn("[AZUL] Pedido no encontrado al crear solicitud de pago", {
      orderId,
      userId: user.id,
    });
    return { ok: false, status: 404, message: "Pedido no encontrado." };
  }

  if (order.payment_status === "paid") {
    return { ok: false, status: 409, message: "Este pedido ya está pagado." };
  }

  if (order.total_cents <= 0) {
    console.error("[AZUL] Total de pedido inválido", {
      orderId,
      totalCents: order.total_cents,
    });
    return { ok: false, status: 400, message: "Total del pedido inválido." };
  }

  await markOrderAsAzulPayment(order.id);
  console.info("[AZUL] Solicitud de pago creada", {
    orderId: order.id,
    amountCents: order.total_cents,
    sandbox: config.sandbox,
  });

  const orderNumber = order.id;
  const amount = String(order.total_cents);

  // ApprovedUrl/DeclinedUrl apuntan al MISMO route handler que ResponsePostUrl:
  // AZUL redirige aquí el navegador del cliente (GET, con el resultado
  // firmado en el querystring) — a diferencia del webhook POST, este camino
  // sí llega a localhost, así que es el que confirma el pago en desarrollo.
  // `processAzulReturn` decide éxito/rechazo leyendo el propio payload y solo
  // entonces redirige a la página de resultado — nunca se procesa dentro del
  // render de una página (Next.js prohíbe revalidateTag ahí).
  const approvedUrl = `${baseUrl}/api/pagos/azul/retorno`;
  const declinedUrl = `${baseUrl}/api/pagos/azul/retorno`;
  // CancelUrl no pasa por ResponsePostUrl (no hay transacción que relayar), así
  // que el orderId va en la propia URL: es la única forma de saber qué pedido
  // se canceló cuando AZUL redirige el navegador aquí directamente.
  const cancelUrl = `${baseUrl}/api/pagos/azul/cancelar?orderId=${encodeURIComponent(orderNumber)}`;
  const responsePostUrl = `${baseUrl}/api/pagos/azul/retorno`;

  const authHashInput = {
    merchantId: config.merchantId,
    merchantName: config.merchantName,
    merchantType: config.merchantType,
    currencyCode: config.currencyCode,
    orderNumber,
    amount,
    ITBIS: config.itbisCents,
    approvedUrl,
    declinedUrl,
    cancelUrl,
    // Se envía en el POST, así que DEBE participar en el hash (tras CancelUrl).
    responsePostUrl,
    useCustomField1: "1",
    customField1Label: "orderId",
    customField1Value: orderNumber,
    useCustomField2: "0",
    authKey: config.secretKey,
  };
  const authHash = buildAzulRequestAuthHash(authHashInput);
  console.info("[AZUL] AuthHash generado", { orderId: order.id });

  const fields: Record<string, string> = {
    MerchantId: config.merchantId,
    // Presente en el formulario del ejemplo oficial; NO participa en el hash.
    TrxType: "Sale",
    MerchantName: config.merchantName,
    MerchantType: config.merchantType,
    CurrencyCode: config.currencyCode,
    OrderNumber: orderNumber,
    Amount: amount,
    ITBIS: config.itbisCents,
    ApprovedUrl: approvedUrl,
    DeclinedUrl: declinedUrl,
    CancelUrl: cancelUrl,
    ResponsePostUrl: responsePostUrl,
    UseCustomField1: "1",
    CustomField1Label: "orderId",
    CustomField1Value: orderNumber,
    UseCustomField2: "0",
    CustomField2Label: "",
    CustomField2Value: "",
    AuthHash: authHash,
    ShowTransactionResult: "0",
  };

  const inputs = Object.entries(fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`,
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"/><title>Redirigiendo a AZUL…</title></head>
<body>
<p>Redirigiendo al pago seguro…</p>
<form id="azul" method="post" action="${escapeHtml(config.paymentPageUrl)}">
${inputs}
<noscript><button type="submit">Continuar al pago</button></noscript>
</form>
<script>document.getElementById("azul").submit();</script>
</body>
</html>`;

  console.info("[AZUL] Redirección construida", {
    orderId: order.id,
    paymentPageUrl: config.paymentPageUrl,
  });

  return { ok: true, html };
}

/** Adaptador `PaymentGateway` — permite invocar AZUL desde código genérico de pasarelas. */
export const azulGateway: PaymentGateway = {
  code: "azul",
  createRedirect: (input: PaymentGatewayRedirectInput) =>
    prepareAzulPaymentRedirect(input),
};
