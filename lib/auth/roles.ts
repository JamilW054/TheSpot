export type UserRole = "client" | "admin";

/** Sin heurística por email: admin solo si `profiles.role` lo indica. */
export function roleFromEmail(_email: string): UserRole {
  return "client";
}

/** Prioriza `profiles.role`; si falta o es inválido, client. */
export function resolveUserRole(
  email: string,
  profileRole: string | null | undefined,
): UserRole {
  if (profileRole === "admin" || profileRole === "client") {
    return profileRole;
  }
  return roleFromEmail(email);
}
