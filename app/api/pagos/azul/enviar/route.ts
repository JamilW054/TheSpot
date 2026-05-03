import { NextResponse } from "next/server";
import { buildAzulRequestAuthHash, escapeHtml } from "@/lib/payments/azul";
import {
  getAzulMerchantIdentifier,
  getAzulSigningSecret,
} from "@/lib/payments/azul-env";
import { createClient } from "@/lib/supabase/server";

function paymentPageUrl(): string {
  return process.env.AZUL_SANDBOX === "true"
    ? "https://pruebas.azul.com.do/PaymentPage/Default.aspx"
    : "https://pagos.azul.com.do/PaymentPage/Default.aspx";
}

/**
 * POST form desde checkout: valida sesión y orden, devuelve HTML que auto-envía el formulario a AZUL.
 */
export async function POST(request: Request) {
  const merchantId = getAzulMerchantIdentifier();
  const authKey = getAzulSigningSecret();
  const merchantName = process.env.AZUL_MERCHANT_NAME?.trim() ?? "BUXXEP STORE";
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ?? new URL(request.url).origin;

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
    return new NextResponse(
      `Config AZUL incompleta (${missing.join("; ")}). En local: revisa .env y reinicia el dev server. En Vercel/hosting: añade las mismas variables en Project Settings → Environment Variables.`,
      { status: 500 },
    );
  }

  let orderId: string;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { orderId?: string };
    orderId = body.orderId?.trim() ?? "";
  } else {
    const fd = await request.formData();
    orderId = fd.get("orderId")?.toString().trim() ?? "";
  }

  if (!orderId) {
    return new NextResponse("orderId requerido.", { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("No autorizado.", { status: 401 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, user_id, total_cents, payment_status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !order) {
    return new NextResponse("Pedido no encontrado.", { status: 404 });
  }

  const row = order as {
    id: string;
    total_cents: number;
    payment_status: string;
  };

  if (row.payment_status === "paid") {
    return new NextResponse("Este pedido ya está pagado.", { status: 409 });
  }

  if (row.total_cents <= 0) {
    return new NextResponse("Total del pedido inválido.", { status: 400 });
  }

  await supabase
    .from("orders")
    .update({ payment_provider: "AZUL" })
    .eq("id", row.id);

  const orderNumber = row.id;
  const amount = String(row.total_cents);
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
    itbis,
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

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
