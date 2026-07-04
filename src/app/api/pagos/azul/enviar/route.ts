import { NextResponse } from "next/server";
import { prepareAzulPaymentRedirect } from "@/features/payments/services/azul-checkout.service";

/**
 * POST form desde checkout: valida sesión y orden, devuelve HTML que auto-envía el formulario a AZUL.
 */
export async function POST(request: Request) {
  let orderId: string;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { orderId?: string };
    orderId = body.orderId?.trim() ?? "";
  } else {
    const fd = await request.formData();
    orderId = fd.get("orderId")?.toString().trim() ?? "";
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ?? new URL(request.url).origin;

  const result = await prepareAzulPaymentRedirect({ orderId, baseUrl });
  if (!result.ok) {
    return new NextResponse(result.message, { status: result.status });
  }
  return new NextResponse(result.html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
