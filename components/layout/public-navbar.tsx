import Link from "next/link";
import { PUBLIC_NAV } from "@/config/navigation";
import { Button } from "@/components/ui";

const ctaItems = [
  { label: "Comprar en Buxxep", href: "#comprar" },
  { label: "Mandar mi diseño", href: "/editor" },
];

export function PublicNavbar() {
  const navLinks = PUBLIC_NAV.filter((item) => item.href !== "/");

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

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
            <ul className="hidden sm:flex items-center gap-6" role="list">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <Link href={ctaItems[0].href} className="hidden sm:inline-flex">
                <Button variant="outline" size="sm">
                  {ctaItems[0].label}
                </Button>
              </Link>
              <Link href={ctaItems[1].href}>
                <Button variant="primary" size="sm">
                  {ctaItems[1].label}
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
