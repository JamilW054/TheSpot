import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { AcceptedPayments } from "@/components/brand/AcceptedPayments";
import { NewsletterForm } from "@/components/landing/NewsletterForm";
import {
  BRAND_NAME,
  BRAND_SUPPORT_EMAIL,
  BRAND_SUPPORT_PHONE,
  BRAND_SUPPORT_PHONE_TEL,
} from "@/config/brand";
import { ORDER_STATUS_PAGE } from "@/config/navigation";

const CONTAINER = "max-w-6xl mx-auto px-4 sm:px-6";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-rose-100 bg-white">
      <div className={`w-full ${CONTAINER} py-10 sm:py-14`}>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="w-fit text-2xl font-black tracking-tight text-foreground transition-colors hover:text-primary"
            >
              the
              <span className="text-primary"> spot</span>
              <span className="text-primary">.</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Las marcas que quieres, en un solo lugar. Perfumes, relojes,
              belleza, gorras y tenis. Pedido sin cuenta. Aceptamos Apple Pay y
              Google Pay.
            </p>
            <address className="not-italic text-xs leading-relaxed text-muted-foreground/70">
              Santo Domingo, República Dominicana
            </address>
            <AcceptedPayments className="mt-1" />
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
              Navegación
            </p>
            <nav
              className="flex flex-col gap-2.5 text-sm text-muted-foreground"
              aria-label="Navegación del footer"
            >
              <Link
                href="/catalogo"
                className="transition-colors hover:text-primary"
              >
                Catálogo
              </Link>
              <Link
                href={ORDER_STATUS_PAGE.href}
                className="transition-colors hover:text-primary"
              >
                {ORDER_STATUS_PAGE.label}
              </Link>
              <Link
                href="/carrito"
                className="transition-colors hover:text-primary"
              >
                Carrito
              </Link>
            </nav>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
              Políticas
            </p>
            <nav
              className="flex flex-col gap-2.5 text-sm text-muted-foreground"
              aria-label="Políticas del footer"
            >
              <Link
                href="/ayuda"
                className="transition-colors hover:text-primary"
              >
                Centro de ayuda
              </Link>
              <Link
                href="/devoluciones"
                className="transition-colors hover:text-primary"
              >
                Devoluciones y reembolsos
              </Link>
              <Link
                href="/entrega"
                className="transition-colors hover:text-primary"
              >
                Política de entrega
              </Link>
              <Link
                href="/privacidad"
                className="transition-colors hover:text-primary"
              >
                Política de privacidad
              </Link>
              <Link
                href="/seguridad"
                className="transition-colors hover:text-primary"
              >
                Seguridad de datos
              </Link>
              <Link
                href="/terminos"
                className="transition-colors hover:text-primary"
              >
                Términos y condiciones
              </Link>
              <Link
                href="/cookies"
                className="transition-colors hover:text-primary"
              >
                Cookies
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground">
                Servicio al Cliente
              </p>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <a
                    href={`mailto:${BRAND_SUPPORT_EMAIL}`}
                    className="break-all transition-colors hover:text-primary"
                  >
                    {BRAND_SUPPORT_EMAIL}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <a
                    href={`tel:${BRAND_SUPPORT_PHONE_TEL}`}
                    className="transition-colors hover:text-primary"
                  >
                    {BRAND_SUPPORT_PHONE}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground">
                Boletín
              </p>
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-rose-100 pt-5 text-xs text-muted-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link
              href="/ayuda"
              className="transition-colors hover:text-primary"
            >
              Ayuda
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/devoluciones"
              className="transition-colors hover:text-primary"
            >
              Devoluciones
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/entrega"
              className="transition-colors hover:text-primary"
            >
              Entrega
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/privacidad"
              className="transition-colors hover:text-primary"
            >
              Privacidad
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/seguridad"
              className="transition-colors hover:text-primary"
            >
              Seguridad
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/terminos"
              className="transition-colors hover:text-primary"
            >
              Términos
            </Link>
            <span aria-hidden>·</span>
            <Link
              href="/cookies"
              className="transition-colors hover:text-primary"
            >
              Cookies
            </Link>
          </div>
          <p className="shrink-0">
            © {new Date().getFullYear()} {BRAND_NAME} · Santo Domingo, República
            Dominicana
          </p>
        </div>
      </div>
    </footer>
  );
}
