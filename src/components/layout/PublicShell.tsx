import { PublicNavbar } from "./public-navbar";
import type { CategoryRow } from "@/database/repositories/categories";

export function PublicShell({
  categories,
  children,
}: {
  categories: CategoryRow[];
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNavbar categories={categories} />
      <main className="flex min-h-0 w-full min-w-0 flex-1 flex-col pt-20 sm:pt-26">
        {children}
      </main>
    </>
  );
}
