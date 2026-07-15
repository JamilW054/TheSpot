import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";

export interface RateLimitOptions {
  action: string;
  identifier: string;
  maxAttempts: number;
  windowSeconds: number;
}

export function requestIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

export async function consumeRateLimit(
  options: RateLimitOptions,
): Promise<boolean> {
  const rawKey = `${options.action}:${options.identifier.toLowerCase()}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("consume_auth_rate_limit", {
    p_key_hash: keyHash,
    p_max_attempts: options.maxAttempts,
    p_window_seconds: options.windowSeconds,
  });
  if (error) {
    console.error("[rate-limit]", error.message);
    return false;
  }
  return data === true;
}
