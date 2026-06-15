export type UserRole = "client" | "admin";

/** Sin heurística por email: admin solo si `profiles.role` lo indica. */
export function roleFromEmail(_email: string): UserRole {
  return "client";
}

/**
 * Prioriza `profiles.role`; si falta o es inválido, client.
 * Acepta el `smallint` del esquema nuevo (0 = admin, 1 = client) y, por
 * compatibilidad, los strings antiguos ("admin"/"client").
 */
export function resolveUserRole(
  email: string,
  profileRole: string | number | null | undefined,
): UserRole {
  if (profileRole === "admin" || profileRole === 0 || profileRole === "0") {
    return "admin";
  }
  if (profileRole === "client" || profileRole === 1 || profileRole === "1") {
    return "client";
  }
  return roleFromEmail(email);
}
