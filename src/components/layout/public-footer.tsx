import { ORDER_STATUS_PAGE } from "@/config/navigation";
import Link from "next/link";
import { NewsletterForm } from "@/components/landing/NewsletterForm";

const CONTAINER = "max-w-6xl mx-auto px-4 sm:px-6";

// ---------------------------------------------------------------------------
// Payment badge logos via CDN
// ---------------------------------------------------------------------------

const CDN_FLAT    = "https://cdn.jsdelivr.net/npm/payment-icons@1.1.0/min/flat";
const CDN_PAYREXX = "https://cdn.jsdelivr.net/gh/payrexx/payment-logos@main/assets/card-icons";

const PAYMENT_METHODS = [
  { id: "visa",       label: "Visa",            src: `${CDN_FLAT}/visa.svg` },
  { id: "mastercard", label: "Mastercard",       src: `${CDN_FLAT}/mastercard.svg` },
  { id: "maestro",    label: "Maestro",          src: `${CDN_FLAT}/maestro.svg` },
  { id: "amex",       label: "American Express", src: `${CDN_FLAT}/amex.svg` },
  { id: "discover",   label: "Discover",         src: `${CDN_FLAT}/discover.svg` },
  { id: "diners",     label: "Diners Club",      src: `${CDN_FLAT}/diners.svg` },
  { id: "jcb",        label: "JCB",              src: `${CDN_FLAT}/jcb.svg` },
  { id: "apple-pay",  label: "Apple Pay",        src: `${CDN_PAYREXX}/card_apple-pay.svg` },
  { id: "google-pay", label: "Google Pay",       src: `${CDN_PAYREXX}/card_google-pay.svg` },
  { id: "visa-secure",  label: "Visa Secure",           src: "/landing/cards-logos/visa-secure_blu_2021.png" },
  { id: "mc-id-check",  label: "Mastercard ID Check",   src: "/landing/cards-logos/mastercardidentitycheck.png" },
  { id: "visa-logo",    label: "Visa",                  src: "/landing/cards-logos/Visa-Logo-2005.jpg" },
  { id: "mastercard-logo", label: "Mastercard",         src: "/landing/cards-logos/mastercard-logo.jpg" },
] as const;

// ---------------------------------------------------------------------------

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
              Buxxep
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tienda en línea de ropa y accesorios personalizados.
            </p>
            {/* Dirección permanente — Requisito Visa/MC */}
            <address className="not-italic text-xs text-muted-foreground/70 leading-relaxed">
              {/* TODO: reemplaza con tu dirección real */}
              Santo Domingo, República Dominicana
            </address>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/buxxep/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              aria-label="Instagram de Buxxep"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              @buxxep
            </a>
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

          {/* Col 3 — Políticas (visibles para tarjetahabientes — Requisito Visa/MC/3DS) */}
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
              <Link href="/eliminar-cuenta" className="hover:text-foreground transition-colors">
                Eliminar cuenta
              </Link>
            </nav>
          </div>

          {/* Col 4 — Contacto + Boletín (Requisito Visa/MC: email y teléfono visibles) */}
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
                  <a href="mailto:soportebuxxep@gmail.com" className="hover:text-foreground transition-colors break-all">
                    soportebuxxep@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  {/* Phone icon */}
                  <svg className="size-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>
                  </svg>
                  <a href="tel:+18098289979" className="hover:text-foreground transition-colors">
                    809-828-9979
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

        {/* ── Métodos de pago aceptados ── */}
        <div className="mt-10 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">

            {/* Badges Visa y Mastercard prominentes (Requisito explícito Visa/MC) */}
            <div className="flex items-center gap-3 shrink-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Aceptamos
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map(({ id, label, src }) => {
                const isBadge = ["visa-secure", "mc-id-check", "visa-logo", "mastercard-logo"].includes(id);
                return (
                  <div
                    key={id}
                    className={`w-[54px] h-[34px] rounded-md overflow-hidden shadow-sm opacity-90 hover:opacity-100 transition-opacity ${isBadge ? "bg-white p-0.5" : ""}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={label}
                      title={label}
                      className={`w-full h-full ${isBadge ? "object-contain" : "object-cover"}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nota de seguridad 3D Secure */}
          <p className="mt-4 text-xs text-muted-foreground/60 flex items-center gap-1.5">
            <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Las transacciones están protegidas con cifrado SSL y autenticación 3D Secure.
            Consulta nuestra{" "}
            <Link href="/seguridad" className="underline hover:text-muted-foreground transition-colors">
              política de seguridad
            </Link>
            .
          </p>
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
            <span aria-hidden>·</span>
            <Link href="/eliminar-cuenta" className="hover:text-muted-foreground transition-colors">
              Eliminar cuenta
            </Link>
          </div>
          <p className="shrink-0">
            © {new Date().getFullYear()} Buxxep · Santo Domingo, República Dominicana
          </p>
        </div>

      </div>
    </footer>
  );
}
