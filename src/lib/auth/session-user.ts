import type { User } from "@supabase/supabase-js";
import { resolveUserRole, type UserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export interface SessionUserWithRole {
  user: User;
  role: UserRole;
}

/**
 * Usuario autenticado + rol resuelto desde `profiles.role`.
 * Tolera esquemas sin la columna `role` (error 42703 / "schema cache"):
 * en ese caso el rol se resuelve como si el perfil no tuviera rol.
 */
export async function getSessionUserWithRole(): Promise<SessionUserWithRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user?.email) return null;

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const pmsg = profileErr?.message ?? "";
  const pr =
    profileErr?.code === "42703" ||
    pmsg.includes("'role' column") ||
    pmsg.includes("schema cache")
      ? undefined
      : profile?.role;
  const role = resolveUserRole(
    user.email,
    typeof pr === "string" || typeof pr === "number" ? pr : undefined,
  );
  return { user, role };
}
