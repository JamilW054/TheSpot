import { createClient as createServerClient } from "@/lib/supabase/server";

const OTP_EXPIRES_MINUTES = 10;
const OTP_LENGTH = 6;

function generateCode(): string {
  const digits = Math.floor(Math.random() * 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");
  return digits;
}

export interface CreateOtpResult {
  code: string;
  expiresInMinutes: number;
}

export async function createOtp(
  email: string,
  purpose: string,
): Promise<CreateOtpResult> {
  const supabase = await createServerClient();
  const code = generateCode();
  const expiresAt = new Date(
    Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000,
  ).toISOString();

  await supabase
    .from("otp_codes")
    .delete()
    .eq("email", email)
    .eq("purpose", purpose);

  const { error } = await supabase.from("otp_codes").insert({
    email,
    code,
    purpose,
    expires_at: expiresAt,
    used: false,
  });

  if (error) throw new Error(`Error creando OTP: ${error.message}`);

  return { code, expiresInMinutes: OTP_EXPIRES_MINUTES };
}

export type VerifyOtpResult =
  | { success: true }
  | { success: false; reason: "invalid" | "expired" | "used" };

export async function verifyOtp(
  email: string,
  code: string,
  purpose: string,
): Promise<VerifyOtpResult> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("otp_codes")
    .select("id, expires_at, used")
    .eq("email", email)
    .eq("code", code)
    .eq("purpose", purpose)
    .maybeSingle();

  if (error || !data) return { success: false, reason: "invalid" };
  if (data.used) return { success: false, reason: "used" };
  if (new Date(data.expires_at) < new Date())
    return { success: false, reason: "expired" };

  await supabase.from("otp_codes").update({ used: true }).eq("id", data.id);

  return { success: true };
}
