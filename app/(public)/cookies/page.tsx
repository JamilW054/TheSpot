import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies — Buxxep",
  description: "Información sobre el uso de cookies y tecnologías similares en Buxxep.",
};

const LAST_UPDATED = "13 de mayo de 2026";

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
            visitas un sitio web. Sirven para recordar tus preferencias, mantener tu sesión iniciada
            y entender cómo usas la plataforma.
          </p>
        </Section>

        <Section title="2. Cookies que utilizamos">
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
                  purpose="Sesión de autenticación de Supabase (mantiene tu login activo)."
                  duration="Sesión / 1 año"
                />
                <CookieRow
                  name="buxxep-cart"
                  type="Funcional"
                  purpose="Guarda los artículos en tu carrito de compras."
                  duration="7 días"
                />
                <CookieRow
                  name="buxxep-theme"
                  type="Funcional"
                  purpose="Recuerda tu preferencia de tema (claro/oscuro)."
                  duration="1 año"
                />
                <CookieRow
                  name="_vercel_*"
                  type="Técnica"
                  purpose="Cookies de infraestructura de Vercel para enrutamiento."
                  duration="Sesión"
                />
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="3. Cookies esenciales">
          <p>
            Las cookies esenciales son necesarias para el funcionamiento básico del Servicio: sin
            ellas no podrías iniciar sesión, mantener artículos en el carrito ni completar una
            compra. No requieren tu consentimiento previo para instalarse.
          </p>
        </Section>

        <Section title="4. Cookies funcionales y de analítica">
          <p>
            Estas cookies nos ayudan a mejorar la experiencia en la plataforma. Actualmente no
            utilizamos servicios de analítica de terceros (como Google Analytics). Si esto cambia,
            actualizaremos esta política y solicitaremos tu consentimiento cuando sea necesario.
          </p>
        </Section>

        <Section title="5. Cookies de terceros">
          <p>
            Algunos servicios externos que utilizamos pueden instalar sus propias cookies:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              <strong className="text-foreground">Supabase:</strong> cookies de sesión para la
              autenticación.
            </li>
            <li>
              <strong className="text-foreground">Vercel:</strong> cookies de infraestructura para
              la entrega del contenido.
            </li>
          </ul>
          <p className="mt-3">
            Estas cookies están sujetas a las políticas de privacidad de sus respectivos
            proveedores.
          </p>
        </Section>

        <Section title="6. Cómo gestionar las cookies">
          <p>
            Puedes controlar y eliminar las cookies desde la configuración de tu navegador. A
            continuación encontrarás instrucciones para los navegadores más comunes:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              <strong className="text-foreground">Chrome:</strong> Configuración → Privacidad y
              seguridad → Cookies.
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
          <p className="mt-3">
            Ten en cuenta que deshabilitar cookies esenciales puede impedir el correcto
            funcionamiento de la plataforma.
          </p>
        </Section>

        <Section title="7. Cambios en esta política">
          <p>
            Podemos actualizar esta Política de Cookies en cualquier momento. Te notificaremos de
            cambios significativos mediante un aviso en la plataforma.
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
    { href: "/terminos", label: "Términos" },
    { href: "/privacidad", label: "Privacidad" },
    { href: "/cookies", label: "Cookies" },
    { href: "/devoluciones", label: "Devoluciones" },
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
