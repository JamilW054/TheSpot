"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export function UserNavLink({ className = "" }: { className?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) return null;

  const initials =
    user.name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0] ?? "")
      .join("")
      .toUpperCase() || "U";

  return (
    <Link
      href="/cuenta"
      aria-label="Mi cuenta"
      title={`Mi cuenta — ${user.name}`}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 font-bold text-[11px] text-primary ring-1 ring-primary/25 transition-all duration-200 hover:bg-primary/25 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      {initials}
    </Link>
  );
}
