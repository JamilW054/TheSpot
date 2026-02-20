import Link from "next/link";
import { Button } from "@/components/ui";
import { CartNavLink } from "./CartNavLink";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex h-14 sm:h-16 items-center justify-between gap-4"
          aria-label="Navegación principal"
        >
          <Link
            href="/"
            className="text-xl font-semibold text-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          >
            Buxxep
          </Link>

          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            <CartNavLink />
            <Link
              href="/catalogo"
              className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            >
              Catálogo
            </Link>
            <Link
              href="/registro"
              className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            >
              Registrarse
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm">
                Login
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
