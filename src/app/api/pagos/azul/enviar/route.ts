import { NextResponse } from "next/server";
import { readAzulEnv } from "@/lib/payments/azul-env";
import { getPaymentGateway } from "@/lib/payments/gateway-registry";

/**
 * POST form desde checkout: valida sesión y orden, devuelve HTML que auto-envía
 * el formulario a la pasarela. Resuelve la pasarela por código (Strategy
 * pattern) en vez de importar el servicio de AZUL directamente, así una ruta
 * de pago futura para otro proveedor solo cambia el código, no esta lógica.
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

  // Dominio para las URLs de retorno: por defecto, el mismo desde el que se
  // inició el pago (localhost en dev, buxxep.com en prod). Así el cliente
  // siempre vuelve al sitio donde estaba — con su sesión intacta.
  // AZUL_RETURN_BASE_URL permite forzar uno (p.ej. un túnel público).
  const baseUrl =
    readAzulEnv("AZUL_RETURN_BASE_URL") || new URL(request.url).origin;

  const gateway = getPaymentGateway("azul");
  if (!gateway) {
    return new NextResponse("Pasarela de pago no disponible.", { status: 500 });
  }

  const result = await gateway.createRedirect({ orderId, baseUrl });
  if (!result.ok) {
    return new NextResponse(result.message, { status: result.status });
  }
  return new NextResponse(result.html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
