import { NextResponse } from "next/server";
import { consumeRateLimit, requestIp } from "@/lib/auth/rate-limit";
import { verifyOtp } from "@/lib/otp";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Código incorrecto. Verifícalo e inténtalo de nuevo.",
  expired: "El código ha expirado. Solicita uno nuevo.",
  used: "Este código ya fue utilizado. Solicita uno nuevo.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const purpose = typeof body?.purpose === "string" ? body.purpose : "verify";

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email y código son requeridos." },
        { status: 400 },
      );
    }

    const allowed = await consumeRateLimit({
      action: `otp-verify:${purpose}`,
      identifier: `${requestIp(request)}:${email}`,
      maxAttempts: 10,
      windowSeconds: 10 * 60,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Solicita un código nuevo más tarde." },
        { status: 429, headers: { "Retry-After": "600" } },
      );
    }

    const result = await verifyOtp(email, code, purpose);

    if (!result.success) {
      return NextResponse.json(
        { error: ERROR_MESSAGES[result.reason] ?? "Código inválido." },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[OTP] Error verificando código:", error);
    return NextResponse.json(
      { error: "Error interno. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
