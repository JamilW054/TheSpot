import { NextResponse } from "next/server";
import { processAzulReturn } from "@/features/payments/services/azul-return.service";
import type { AzulReturnPayload } from "@/lib/payments/azul";

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
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ?? new URL(request.url).origin;

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
