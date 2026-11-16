"use client";

import { useAuth } from "@/lib/auth-context";
import { homePathForRole, ROLE } from "@/lib/auth/roles";
import Link from "next/link";

/**
 * Atajo al panel de administración cuando el admin navega el sitio público
 * con sesión iniciada. No hay cuentas de cliente, así que no se renderiza
 * nada para nadie más.
 */
export function UserNavLink({ className = "" }: { className?: string }) {
  const { user, isLoading } = useAuth();

  if (
    isLoading ||
    !user ||
    (user.role !== ROLE.ADMIN && user.role !== ROLE.SELLER)
  ) {
    return null;
  }
  const href = homePathForRole(user.role);
  const label = user.role === ROLE.ADMIN ? "Panel de administración" : "Panel de mi tienda";

  const initials =
    user.name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0] ?? "")
      .join("")
      .toUpperCase() || "U";

  return (
    <Link
      href={href}
      aria-label={label}
      title={`${label} — ${user.name}`}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 font-bold text-[11px] text-primary ring-1 ring-primary/25 transition-all duration-200 hover:bg-primary/25 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      {initials}
    </Link>
  );
}
