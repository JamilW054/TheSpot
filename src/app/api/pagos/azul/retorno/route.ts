import { NextResponse } from "next/server";
import { processAzulReturn } from "@/features/payments/services/azul-return.service";
import type { AzulReturnPayload } from "@/lib/payments/azul";
import { readAzulEnv } from "@/lib/payments/azul-env";

function normalizePayload(formData: FormData): AzulReturnPayload {
  const payload: AzulReturnPayload = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") payload[key] = value;
  }
  return payload;
}

function payloadFromSearchParams(params: URLSearchParams): AzulReturnPayload {
  const payload: AzulReturnPayload = {};
  for (const [key, value] of params.entries()) {
    payload[key] = value;
  }
  return payload;
}

/**
 * Webhook server-to-server (`ResponsePostUrl`): AZUL hace este POST desde su
 * propio servidor — inalcanzable si el comercio corre en localhost, pero es
 * el camino principal en producción.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload = normalizePayload(formData);
    const baseUrl =
      readAzulEnv("AZUL_RETURN_BASE_URL") || new URL(request.url).origin;

    const outcome = await processAzulReturn(payload, baseUrl);
    if (outcome.kind === "redirect") {
      return NextResponse.redirect(outcome.url, { status: 303 });
    }
    return new NextResponse(outcome.message, { status: outcome.status });
  } catch (error) {
    console.error("[AZUL] Error interno procesando retorno", error);
    return new NextResponse("Error interno procesando el retorno de pago.", {
      status: 500,
    });
  }
}

/**
 * `ApprovedUrl`/`DeclinedUrl`: AZUL redirige aquí el NAVEGADOR del cliente
 * (con el resultado firmado en el querystring) — este camino sí llega a
 * localhost, así que es el que confirma el pago en desarrollo. En
 * producción es un refuerzo idempotente si el webhook falla o tarda.
 * `processAzulReturn` decide el destino final (éxito/rechazo) leyendo el
 * propio payload, así que da igual cuál de las dos URLs haya usado AZUL.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const payload = payloadFromSearchParams(url.searchParams);
    const baseUrl = readAzulEnv("AZUL_RETURN_BASE_URL") || url.origin;

    const outcome = await processAzulReturn(payload, baseUrl);
    if (outcome.kind === "redirect") {
      return NextResponse.redirect(outcome.url, { status: 303 });
    }
    return new NextResponse(outcome.message, { status: outcome.status });
  } catch (error) {
    console.error("[AZUL] Error interno procesando retorno", error);
    return NextResponse.redirect(new URL("/pagos/rechazado", request.url), {
      status: 303,
    });
  }
}
