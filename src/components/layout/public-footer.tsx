import { ORDER_STATUS_PAGE } from "@/config/navigation";
import Link from "next/link";
import { NewsletterForm } from "@/components/landing/NewsletterForm";

const CONTAINER = "max-w-6xl mx-auto px-4 sm:px-6";
const SUPPORT_EMAIL = "jamilwilliams054@gmail.com";
const SUPPORT_PHONE_TEL = "+18097612875";
const SUPPORT_PHONE_LABEL = "809-761-2875";

export function PublicFooter() {
  return (
    <footer className="mt-auto bg-card border-t border-border">
      <div className={`w-full ${CONTAINER} py-10 sm:py-14`}>

        {/* ── Grid principal: 4 columnas en desktop ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 — Marca + Dirección */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-xl font-bold text-foreground hover:text-foreground/80 transition-colors w-fit"
            >
              JW PARFUM
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Perfumería en línea. Fragancias originales para él y para ella.
            </p>
            <address className="not-italic text-xs text-muted-foreground/70 leading-relaxed">
              Santo Domingo, República Dominicana
            </address>
          </div>

          {/* Col 2 — Navegación */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-4">
              Navegación
            </p>
            <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground" aria-label="Navegación del footer">
              <Link href="/catalogo" className="hover:text-foreground transition-colors">
                Catálogo
              </Link>
              <Link href={ORDER_STATUS_PAGE.href} className="hover:text-foreground transition-colors">
                {ORDER_STATUS_PAGE.label}
              </Link>
              <Link href="/carrito" className="hover:text-foreground transition-colors">
                Carrito
              </Link>
            </nav>
          </div>

          {/* Col 3 — Políticas */}
          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-4">
              Políticas
            </p>
            <nav className="flex flex-col gap-2.5 text-sm text-muted-foreground" aria-label="Políticas del footer">
              <Link href="/ayuda" className="hover:text-foreground transition-colors">
                Centro de ayuda
              </Link>
              <Link href="/devoluciones" className="hover:text-foreground transition-colors">
                Devoluciones y reembolsos
              </Link>
              <Link href="/entrega" className="hover:text-foreground transition-colors">
                Política de entrega
              </Link>
              <Link href="/privacidad" className="hover:text-foreground transition-colors">
                Política de privacidad
              </Link>
              <Link href="/seguridad" className="hover:text-foreground transition-colors">
                Seguridad de datos
              </Link>
              <Link href="/terminos" className="hover:text-foreground transition-colors">
                Términos y condiciones
              </Link>
              <Link href="/cookies" className="hover:text-foreground transition-colors">
                Cookies
              </Link>
            </nav>
          </div>

          {/* Col 4 — Contacto + Boletín */}
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-4">
                Servicio al Cliente
              </p>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  {/* Email icon */}
                  <svg className="size-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground transition-colors break-all">
                    {SUPPORT_EMAIL}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  {/* WhatsApp icon */}
                  <svg className="size-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
                  </svg>
                  <a href={`tel:${SUPPORT_PHONE_TEL}`} className="hover:text-foreground transition-colors">
                    {SUPPORT_PHONE_LABEL}
                  </a>
                </li>
              </ul>
            </div>

            {/* Boletín */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-3">
                Boletín
              </p>
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* ── Barra legal ── */}
        <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground/60">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link href="/ayuda" className="hover:text-muted-foreground transition-colors">
              Ayuda
            </Link>
            <span aria-hidden>·</span>
            <Link href="/devoluciones" className="hover:text-muted-foreground transition-colors">
              Devoluciones
            </Link>
            <span aria-hidden>·</span>
            <Link href="/entrega" className="hover:text-muted-foreground transition-colors">
              Entrega
            </Link>
            <span aria-hidden>·</span>
            <Link href="/privacidad" className="hover:text-muted-foreground transition-colors">
              Privacidad
            </Link>
            <span aria-hidden>·</span>
            <Link href="/seguridad" className="hover:text-muted-foreground transition-colors">
              Seguridad
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terminos" className="hover:text-muted-foreground transition-colors">
              Términos
            </Link>
            <span aria-hidden>·</span>
            <Link href="/cookies" className="hover:text-muted-foreground transition-colors">
              Cookies
            </Link>
          </div>
          <p className="shrink-0">
            © {new Date().getFullYear()} JW PARFUM · Santo Domingo, República Dominicana
          </p>
        </div>

      </div>
    </footer>
  );
}
