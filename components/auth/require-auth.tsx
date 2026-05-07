"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface RequireAuthProps {
  children: React.ReactNode;
  /** Si es true, exige user.role === "admin" (según profiles.role en BD); si no, redirige a /mis-disenos */
  requireAdmin?: boolean;
}

export function RequireAuth({
  children,
  requireAdmin = false,
}: RequireAuthProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (requireAdmin && user.role !== "admin") {
      router.replace("/mis-disenos");
    }
  }, [user, isLoading, requireAdmin, router]);

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
  if (requireAdmin && user.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
