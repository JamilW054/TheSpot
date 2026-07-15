import { NextResponse } from "next/server";
import { consumeRateLimit, requestIp } from "@/lib/auth/rate-limit";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/resend";

const ALLOWED_PURPOSES = ["verify", "reset-password", "checkout"] as const;
type Purpose = (typeof ALLOWED_PURPOSES)[number];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const purpose: Purpose = ALLOWED_PURPOSES.includes(body?.purpose)
      ? body.purpose
      : "verify";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    const allowed = await consumeRateLimit({
      action: `otp-send:${purpose}`,
      identifier: `${requestIp(request)}:${email}`,
      maxAttempts: 5,
      windowSeconds: 15 * 60,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Inténtalo de nuevo más tarde." },
        { status: 429, headers: { "Retry-After": "900" } },
      );
    }

    const { code, expiresInMinutes } = await createOtp(email, purpose);

    const name = typeof body?.name === "string" ? body.name.trim() : "Usuario";
    await sendOtpEmail(email, { name, code, expiresInMinutes });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[OTP] Error enviando código:", error);
    return NextResponse.json(
      { error: "No se pudo enviar el código. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
