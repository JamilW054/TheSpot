import Link from "next/link";
import { Button } from "@/components/ui";
import { CartNavLink } from "./CartNavLink";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav
          className="flex h-16 items-center justify-between gap-6"
          aria-label="Navegación principal"
        >
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          >
            Buxxep
          </Link>

          <div className="hidden sm:flex items-center gap-8">
            <Link
              href="/catalogo"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Catálogo
            </Link>
            <Link
              href="/editor"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Editor
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <CartNavLink />
            <Link
              href="/registro"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Registrarse
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm" className="rounded-full px-5">
                Entrar
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
