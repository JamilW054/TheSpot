import Link from "next/link";
import { NewsletterForm } from "@/components/landing/NewsletterForm";

const CONTAINER = "max-w-6xl mx-auto px-4 sm:px-6";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className={`w-full ${CONTAINER} py-6 sm:py-10`}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 sm:gap-8 lg:gap-12">
          {/* Col 1: Logo */}
          <div className="shrink-0">
            <Link href="/" className="text-lg sm:text-xl font-bold text-foreground hover:text-primary transition-colors">
              Buxxep
            </Link>
          </div>
          {/* Col 2: Redes + Newsletter — en móvil puede envolver para no desbordar */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 min-w-0 flex-1 md:justify-center">
            <a
              href="https://www.instagram.com/buxxep/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              aria-label="Instagram"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <p className="font-semibold text-foreground text-sm shrink-0">Suscríbete al boletín</p>
            <div className="w-full min-w-0 flex-1 basis-full sm:basis-auto sm:max-w-md">
              <NewsletterForm />
            </div>
          </div>
          {/* Col 3: Enlaces — a la derecha */}
          <div className="shrink-0 text-left md:text-right">
            <p className="font-semibold text-foreground text-sm mb-2 sm:mb-3">Enlaces</p>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground md:items-end" aria-label="Enlaces del footer">
              <Link href="/catalogo" className="hover:text-foreground transition-colors">Catálogo</Link>
              <Link href="/editor" className="hover:text-foreground transition-colors">Editor</Link>
              <Link href="/carrito" className="hover:text-foreground transition-colors">Carrito</Link>
            </nav>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/catalogo" className="hover:text-foreground transition-colors">Términos y condiciones</Link>
            <span className="opacity-60" aria-hidden>•</span>
            <Link href="/catalogo" className="hover:text-foreground transition-colors">Política de privacidad</Link>
          </div>
          <p>© {new Date().getFullYear()} Buxxep. Todos los derechos reservados. CEO — Biandy Peguero</p>
        </div>
      </div>
    </footer>
  );
}
