import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    // Usa el origin real de la request para que funcione en local y en producción
    const origin = new URL(request.url).origin;
    const redirectTo = `${origin}/auth/callback?next=/nueva-contrasena`;

    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error("[RESET-PASSWORD]", error.message);
    }

    // Siempre retorna ok — nunca revelar si el email existe
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[RESET-PASSWORD] Error:", error);
    return NextResponse.json({ ok: true });
  }
}
