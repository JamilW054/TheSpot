import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies — JW PARFUM",
  description: "Información sobre el uso de cookies y almacenamiento local en JW PARFUM.",
};

const LAST_UPDATED = "16 de agosto de 2026";

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Política de Cookies
        </h1>
        <p className="text-sm text-muted-foreground">Última actualización: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">

        <Section title="1. ¿Qué son las cookies?">
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando
            visitas un sitio web. JW PARFUM no requiere que crees una cuenta, así que usamos muy
            pocas: la mayoría de tus datos (carrito, favoritos) se guardan en el almacenamiento
            local de tu navegador, no en cookies.
          </p>
        </Section>

        <Section title="2. Cookies y almacenamiento que utilizamos">
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 text-left font-semibold text-foreground">Nombre</th>
                  <th className="py-2 pr-4 text-left font-semibold text-foreground">Tipo</th>
                  <th className="py-2 pr-4 text-left font-semibold text-foreground">Finalidad</th>
                  <th className="py-2 text-left font-semibold text-foreground">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <CookieRow
                  name="sb-*"
                  type="Esencial"
                  purpose="Sesión de autenticación de Supabase (solo aplica al panel de administración)."
                  duration="Sesión / 1 año"
                />
                <CookieRow
                  name="jwparfum-cart (localStorage)"
                  type="Funcional"
                  purpose="Guarda los artículos en tu carrito de compras en tu propio navegador."
                  duration="Hasta que lo borres"
                />
                <CookieRow
                  name="jwparfum_wishlist (localStorage)"
                  type="Funcional"
                  purpose="Guarda tus productos favoritos en tu propio navegador."
                  duration="Hasta que lo borres"
                />
                <CookieRow
                  name="theme (localStorage)"
                  type="Funcional"
                  purpose="Recuerda tu preferencia de tema (claro/oscuro)."
                  duration="Hasta que lo borres"
                />
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="3. Cookies esenciales">
          <p>
            La única cookie esencial (`sb-*`) mantiene la sesión iniciada del panel de
            administración — no aplica a los visitantes del catálogo público, que no necesitan
            iniciar sesión para comprar. No requiere tu consentimiento previo para instalarse.
          </p>
        </Section>

        <Section title="4. Cookies de analítica">
          <p>
            Actualmente no utilizamos servicios de analítica de terceros (como Google Analytics).
            Si esto cambia, actualizaremos esta política y solicitaremos tu consentimiento cuando
            sea necesario.
          </p>
        </Section>

        <Section title="5. Cómo gestionar las cookies y el almacenamiento local">
          <p>
            Puedes controlar y eliminar las cookies y el almacenamiento local desde la
            configuración de tu navegador. Ten en cuenta que borrar el almacenamiento local
            vaciará tu carrito y tu lista de favoritos.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              <strong className="text-foreground">Chrome:</strong> Configuración → Privacidad y
              seguridad → Cookies y otros datos de sitios.
            </li>
            <li>
              <strong className="text-foreground">Firefox:</strong> Preferencias → Privacidad y
              seguridad.
            </li>
            <li>
              <strong className="text-foreground">Safari:</strong> Preferencias → Privacidad.
            </li>
            <li>
              <strong className="text-foreground">Edge:</strong> Configuración → Cookies y permisos
              del sitio.
            </li>
          </ul>
        </Section>

        <Section title="6. Cambios en esta política">
          <p>
            Podemos actualizar esta Política de Cookies en cualquier momento. Te notificaremos de
            cambios significativos mediante un aviso en el sitio.
          </p>
        </Section>

      </div>

      <LegalNav current="cookies" />
    </div>
  );
}

function CookieRow({
  name,
  type,
  purpose,
  duration,
}: {
  name: string;
  type: string;
  purpose: string;
  duration: string;
}) {
  return (
    <tr>
      <td className="py-2 pr-4 font-mono text-foreground">{name}</td>
      <td className="py-2 pr-4">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{type}</span>
      </td>
      <td className="py-2 pr-4">{purpose}</td>
      <td className="py-2 whitespace-nowrap">{duration}</td>
    </tr>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function LegalNav({ current }: { current: string }) {
  const links = [
    { href: "/ayuda",        label: "Ayuda" },
    { href: "/terminos",     label: "Términos" },
    { href: "/privacidad",   label: "Privacidad" },
    { href: "/cookies",      label: "Cookies" },
    { href: "/devoluciones", label: "Devoluciones" },
    { href: "/entrega",      label: "Entrega" },
    { href: "/seguridad",    label: "Seguridad" },
  ];
  return (
    <div className="mt-12 border-t border-border pt-8">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Otras políticas
      </p>
      <div className="flex flex-wrap gap-3">
        {links
          .filter((l) => !l.href.includes(current))
          .map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
      </div>
    </div>
  );
}
