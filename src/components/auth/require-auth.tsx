"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROLE } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth-context";

interface RequireAuthProps {
  children: React.ReactNode;
  /** Si es true, exige user.role === "admin" (según profiles.role en BD); si no, vuelve a inicio. */
  requireAdmin?: boolean;
  /** Si es true, exige dueño de tienda (seller) o admin (dueño de la tienda oficial). */
  requireSeller?: boolean;
}

export function RequireAuth({
  children,
  requireAdmin = false,
  requireSeller = false,
}: RequireAuthProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // No hay cuentas de cliente: si alguien con sesión no-admin llega hasta
    // aquí (caso defensivo, no debería ocurrir), no hay "mi cuenta" a la que
    // mandarlo — vuelve a inicio.
    if (requireAdmin && user.role !== ROLE.ADMIN) {
      router.replace(user.role === ROLE.SELLER ? "/panel" : "/");
      return;
    }
    if (requireSeller && user.role !== ROLE.SELLER && user.role !== ROLE.ADMIN) {
      router.replace("/");
    }
  }, [user, isLoading, requireAdmin, requireSeller, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-8 w-8 animate-pulse rounded-full bg-muted"
          aria-hidden
        />
      </div>
    );
  }
  if (!user) {
    return null;
  }
  if (requireAdmin && user.role !== ROLE.ADMIN) {
    return null;
  }
  if (requireSeller && user.role !== ROLE.SELLER && user.role !== ROLE.ADMIN) {
    return null;
  }

  return <>{children}</>;
}
