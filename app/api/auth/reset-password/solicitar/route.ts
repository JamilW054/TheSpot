import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendResetPasswordEmail } from "@/lib/emails";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ??
      new URL(request.url).origin;

    const supabase = createServiceClient();

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${baseUrl}/auth/callback?next=/nueva-contrasena`,
      },
    });

    if (error || !data?.properties?.action_link) {
      // Return success even if email not found — prevents user enumeration
      return NextResponse.json({ ok: true });
    }

    const resetUrl = data.properties.action_link;

    const name =
      (data.user?.user_metadata?.full_name as string | undefined) ??
      (data.user?.user_metadata?.name as string | undefined) ??
      email.split("@")[0];

    await sendResetPasswordEmail(email, {
      name,
      resetUrl,
      expiresInMinutes: 60,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[RESET-PASSWORD] Error:", error);
    // Always return ok to prevent user enumeration
    return NextResponse.json({ ok: true });
  }
}
