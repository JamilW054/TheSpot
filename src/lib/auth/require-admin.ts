import { ROLE } from "@/lib/auth/roles";
import { getSessionUserWithRole } from "@/lib/auth/session-user";

/** Solo usuarios con `profiles.role === admin`. Lanza si no hay sesión o no es admin. */
export async function requireAdmin(): Promise<{ userId: string }> {
  const session = await getSessionUserWithRole();
  if (!session || session.role !== ROLE.ADMIN) {
    throw new Error("No autorizado.");
  }
  return { userId: session.user.id };
}
