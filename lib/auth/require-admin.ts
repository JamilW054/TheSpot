import { resolveUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

/** Solo usuarios con `profiles.role === admin`. Lanza si no hay sesión o no es admin. */
export async function requireAdmin(): Promise<{ userId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user?.email) {
    throw new Error("No autorizado.");
  }
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
    typeof pr === "string" ? pr : undefined,
  );
  if (role !== "admin") {
    throw new Error("No autorizado.");
  }
  return { userId: user.id };
}
