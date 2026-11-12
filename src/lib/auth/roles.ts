/**
 * Fuente única de verdad para los roles de usuario. Evita strings sueltos
 * ("admin"/"client") repartidos por la app: úsese `ROLE.ADMIN` / `ROLE.CLIENT`
 * en cualquier comprobación de permisos (frontend y backend) y `ROLE_DB` para
 * el `smallint` que persiste `profiles.role`.
 */
export const ROLE = {
  ADMIN: "admin",
  CLIENT: "client",
  /** Dueño de una tienda del marketplace (panel `/panel`). */
  SELLER: "seller",
} as const;

export type UserRole = (typeof ROLE)[keyof typeof ROLE];

/** Valores `smallint` de `profiles.role` en la base de datos. */
export const ROLE_DB = {
  ADMIN: 0,
  CLIENT: 1,
  SELLER: 2,
} as const;

export type RoleDbValue = (typeof ROLE_DB)[keyof typeof ROLE_DB];

/** Sin heurística por email: admin solo si `profiles.role` lo indica. */
export function roleFromEmail(_email: string): UserRole {
  return ROLE.CLIENT;
}

/**
 * Prioriza `profiles.role`; si falta o es inválido, client.
 * Acepta el `smallint` del esquema nuevo (0 = admin, 1 = client, 2 = seller) y, por
 * compatibilidad, los strings antiguos ("admin"/"client").
 */
export function resolveUserRole(
  email: string,
  profileRole: string | number | null | undefined,
): UserRole {
  if (
    profileRole === ROLE.ADMIN ||
    profileRole === ROLE_DB.ADMIN ||
    profileRole === String(ROLE_DB.ADMIN)
  ) {
    return ROLE.ADMIN;
  }
  if (
    profileRole === ROLE.SELLER ||
    profileRole === ROLE_DB.SELLER ||
    profileRole === String(ROLE_DB.SELLER)
  ) {
    return ROLE.SELLER;
  }
  if (
    profileRole === ROLE.CLIENT ||
    profileRole === ROLE_DB.CLIENT ||
    profileRole === String(ROLE_DB.CLIENT)
  ) {
    return ROLE.CLIENT;
  }
  return roleFromEmail(email);
}

/** True si el rol resuelto es administrador. */
export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === ROLE.ADMIN;
}

/** True si el rol resuelto es dueño de tienda. */
export function isSellerRole(role: UserRole | null | undefined): boolean {
  return role === ROLE.SELLER;
}

/** Ruta de inicio de cada rol tras iniciar sesión. */
export function homePathForRole(role: UserRole | null | undefined): string {
  if (role === ROLE.ADMIN) return "/admin";
  if (role === ROLE.SELLER) return "/panel";
  return "/";
}
