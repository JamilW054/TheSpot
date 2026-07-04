"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

type AdminEditorLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

/** Enlace al editor u otras rutas solo-admin; no renderiza nada si el usuario no es admin. */
export function AdminEditorLink({
  href,
  className,
  children,
}: AdminEditorLinkProps) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role !== "admin") return null;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
