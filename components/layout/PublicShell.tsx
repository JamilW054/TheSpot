"use client";

import { usePathname } from "next/navigation";
import { PublicNavbar } from "./public-navbar";
import type { CategoryRow } from "@/lib/db/categories";

export function PublicShell({
  categories,
  children,
}: {
  categories: CategoryRow[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCuenta = pathname.startsWith("/cuenta");

  return (
    <>
      {!isCuenta && <PublicNavbar categories={categories} />}
      <main
        className={`flex min-h-0 w-full min-w-0 flex-1 flex-col${!isCuenta ? " pt-20 sm:pt-26" : ""}`}
      >
        {children}
      </main>
    </>
  );
}
