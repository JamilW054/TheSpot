import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Lógica central de eliminación/restauración de cuenta.
 *
 * No hay RPC, triggers ni funciones de base de datos para esto: todo vive aquí
 * y se reutiliza desde el login (lib/auth-context.tsx vía lib/actions/account.ts)
 * y desde el guard de sesión del servidor (middleware.ts). La app móvil aplica
 * exactamente esta misma lógica.
 *
 * La verificación de "vencida" DEBE ser server-side: usamos la service role key
 * y nunca confiamos solo en el cliente.
 */

/** Período de gracia tras solicitar la eliminación, en días. */
export const ACCOUNT_GRACE_PERIOD_DAYS = 30;

const GRACE_PERIOD_MS = ACCOUNT_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

/** Mensaje mostrado cuando la cuenta venció el período de recuperación. */
export const ACCOUNT_EXPIRED_MESSAGE =
  "Esta cuenta fue eliminada y el período de recuperación de 30 días venció.";

export type AccountStatus = "active" | "restored" | "expired";

/**
 * Cliente Supabase con service role (bypass RLS). Se construye aquí con un
 * import ESM en lugar de `require` para que funcione tanto en el runtime de
 * Node (Server Actions) como en el Edge (middleware).
 */
function serviceClient() {
  const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Marca la cuenta como eliminada (`deleted_at = now()`). El que la invoca debe
 * cerrar la sesión del usuario después.
 */
export async function markAccountDeleted(userId: string): Promise<void> {
  if (!userId) throw new Error("userId requerido.");
  const supabase = serviceClient();
  const { error } = await supabase
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

/**
 * Única fuente de verdad sobre el estado de eliminación de una cuenta.
 * Se llama en cada inicio de sesión y en el guard de sesión del servidor.
 *
 *  - deleted_at NULL                  -> 'active'   (continuar).
 *  - dentro de los 30 días            -> restaura (deleted_at = NULL) -> 'restored'.
 *  - pasados los 30 días              -> 'expired'  (el llamador cierra sesión).
 *  - error de lectura                 -> fail-open 'active' (no bloquear legítimos).
 */
export async function resolveAccountStatus(
  userId: string,
): Promise<AccountStatus> {
  if (!userId) return "active";
  try {
    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("deleted_at")
      .eq("id", userId)
      .maybeSingle();
    // Fail-open: ante error de lectura no bloqueamos al usuario.
    if (error) return "active";

    const deletedAt = (data?.deleted_at as string | null | undefined) ?? null;
    if (!deletedAt) return "active";

    const elapsedMs = Date.now() - new Date(deletedAt).getTime();
    if (elapsedMs <= GRACE_PERIOD_MS) {
      const { error: restoreError } = await supabase
        .from("profiles")
        .update({ deleted_at: null })
        .eq("id", userId);
      // Si la restauración falla, no bloqueamos: tratamos como activa.
      if (restoreError) return "active";
      return "restored";
    }
    return "expired";
  } catch {
    return "active";
  }
}
