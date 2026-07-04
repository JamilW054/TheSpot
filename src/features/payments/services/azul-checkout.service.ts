import {
  getOrderPaymentInfoForUser,
  markOrderAsAzulPayment,
} from "@/database/repositories";
import { buildAzulRequestAuthHash, escapeHtml } from "@/lib/payments/azul";
import {
  getAzulMerchantIdentifier,
  getAzulSigningSecret,
} from "@/lib/payments/azul-env";
import { createClient } from "@/lib/supabase/server";

export type AzulCheckoutResult =
  | { ok: true; html: string }
  | { ok: false; status: number; message: string };

function paymentPageUrl(): string {
  return process.env.AZUL_SANDBOX === "true"
    ? "https://pruebas.azul.com.do/PaymentPage/Default.aspx"
    : "https://pagos.azul.com.do/PaymentPage/Default.aspx";
}

/**
 * Valida sesión y pedido, marca el pedido como pago AZUL y construye el HTML
 * que auto-envía el formulario firmado a la página de pago de AZUL.
 */
export async function prepareAzulPaymentRedirect(params: {
  orderId: string;
  baseUrl: string;
}): Promise<AzulCheckoutResult> {
  const { orderId, baseUrl } = params;
  const merchantId = getAzulMerchantIdentifier();
  const authKey = getAzulSigningSecret();
  const merchantName = process.env.AZUL_MERCHANT_NAME?.trim() ?? "BUXXEP STORE";

  if (!merchantId || !authKey) {
    const missing: string[] = [];
    if (!merchantId) {
      missing.push(
        "MerchantId: AZUL_MERCHANT_ID o bien AZUL_USE_CLIENT_KEY_AS_MERCHANT_ID=true + AZUL_CLIENT_KEY",
      );
    }
    if (!authKey) {
      missing.push("secreto firma: AZUL_SECRET_KEY (o AZUL_AUTH_KEY)");
    }
    return {
      ok: false,
      status: 500,
      message: `Config AZUL incompleta (${missing.join("; ")}). En local: revisa .env y reinicia el dev server. En Vercel/hosting: añade las mismas variables en Project Settings → Environment Variables.`,
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
    return { ok: false, status: 404, message: "Pedido no encontrado." };
  }

  if (order.payment_status === "paid") {
    return { ok: false, status: 409, message: "Este pedido ya está pagado." };
  }

  if (order.total_cents <= 0) {
    return { ok: false, status: 400, message: "Total del pedido inválido." };
  }

  await markOrderAsAzulPayment(order.id);

  const orderNumber = order.id;
  const amount = String(order.total_cents);
  const itbis = process.env.AZUL_ITBIS_CENTS?.trim() ?? "0";

  const approvedUrl = `${baseUrl}/pagos/exitoso`;
  const declinedUrl = `${baseUrl}/pagos/rechazado`;
  const cancelUrl = `${baseUrl}/carrito`;
  const responsePostUrl = `${baseUrl}/api/pagos/azul/retorno`;

  const authHash = buildAzulRequestAuthHash({
    merchantId,
    merchantName,
    merchantType:
      process.env.AZUL_MERCHANT_TYPE?.trim() ?? "Comercio electronico",
    currencyCode: process.env.AZUL_CURRENCY_CODE?.trim() ?? "$",
    orderNumber,
    amount,
    ITBIS: itbis,
    approvedUrl,
    declinedUrl,
    cancelUrl,
    useCustomField1: "1",
    customField1Label: "orderId",
    customField1Value: orderNumber,
    useCustomField2: "0",
    authKey,
  });

  const fields: Record<string, string> = {
    MerchantId: merchantId,
    MerchantName: merchantName,
    MerchantType:
      process.env.AZUL_MERCHANT_TYPE?.trim() ?? "Comercio electronico",
    CurrencyCode: process.env.AZUL_CURRENCY_CODE?.trim() ?? "$",
    OrderNumber: orderNumber,
    Amount: amount,
    ITBIS: itbis,
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
<form id="azul" method="post" action="${escapeHtml(paymentPageUrl())}">
${inputs}
<noscript><button type="submit">Continuar al pago</button></noscript>
</form>
<script>document.getElementById("azul").submit();</script>
</body>
</html>`;

  return { ok: true, html };
}
