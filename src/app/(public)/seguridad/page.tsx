import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_SUPPORT_EMAIL, BRAND_SUPPORT_PHONE } from "@/config/brand";

export const metadata: Metadata = {
  title: "Seguridad de Datos — The Spot",
  description:
    "Cómo The Spot protege tus datos: sin cuentas de cliente, conexión cifrada y pedido de invitado.",
};

const LAST_UPDATED = "16 de agosto de 2026";

export default function SeguridadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
          Legal
        </p>
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Seguridad de Datos
        </h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: {LAST_UPDATED}
        </p>
      </div>

      {/* Highlight box */}
      <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm text-foreground">
          <strong>Resumen:</strong> The Spot no procesa pagos en línea ni pide
          datos de tarjeta en ningún momento — no hay nada de eso que proteger.
          Tampoco creamos cuentas de cliente: el pedido se hace como invitado y
          te contactamos por correo o teléfono para coordinar el pago (Apple Pay
          o Google Pay) y la entrega.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <Section title="1. Cifrado en tránsito (SSL/TLS)">
          <p>
            Toda la comunicación entre tu navegador y nuestros servidores se
            realiza mediante{" "}
            <strong className="text-foreground">HTTPS con cifrado TLS</strong>.
            La información que compartes en el checkout (nombre, teléfono,
            dirección) viaja encriptada y no puede ser interceptada por
            terceros.
          </p>
          <p className="mt-2">
            Puedes verificar la conexión segura por el candado (🔒) que aparece
            en la barra de dirección de tu navegador al visitar este sitio.
          </p>
        </Section>

        <Section title="2. Sin pagos en línea">
          <p>
            The Spot{" "}
            <strong className="text-foreground">
              no cobra ni procesa tarjetas en el sitio
            </strong>
            . Al confirmar un pedido, este queda pendiente y te contactamos por
            correo o teléfono para coordinar el pago (Apple Pay o Google Pay) y
            la entrega. No pedimos número de tarjeta, CVV ni ningún dato de pago
            a través del sitio.
          </p>
        </Section>

        <Section title="3. Sin cuentas de cliente">
          <p>
            No es necesario registrarte ni crear una contraseña para comprar. El
            checkout es de invitado: solo pedimos los datos necesarios para
            entregar tu pedido (nombre, teléfono, dirección y correo). Puedes
            consultar el estado de tu pedido más adelante con el número que te
            damos al confirmarlo, en{" "}
            <Link
              href="/estado-pedido"
              className="text-primary hover:underline"
            >
              Estado del pedido
            </Link>
            .
          </p>
        </Section>

        <Section title="4. Panel administrativo">
          <p>
            El único inicio de sesión del sitio es el del equipo de The Spot
            para gestionar el catálogo y los pedidos, protegido con
            autenticación de Supabase y control de acceso a nivel de fila
            (Row-Level Security) en la base de datos.
          </p>
        </Section>

        <Section title="5. Notificación de incidentes">
          <p>
            En el improbable caso de que detectemos una brecha de seguridad que
            afecte tus datos, te notificaremos en un plazo razonable desde que
            tengamos conocimiento del incidente, conforme a la legislación
            aplicable.
          </p>
        </Section>

        <Section title="6. Contacto de seguridad">
          <p>
            Si detectas una vulnerabilidad o tienes dudas sobre la seguridad de
            tus datos, contáctanos:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              Correo:{" "}
              <a
                href={`mailto:${BRAND_SUPPORT_EMAIL}`}
                className="text-primary hover:underline"
              >
                {BRAND_SUPPORT_EMAIL}
              </a>
            </li>
            <li>Teléfono: {BRAND_SUPPORT_PHONE}</li>
          </ul>
        </Section>
      </div>

      <LegalNav current="seguridad" />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function LegalNav({ current }: { current: string }) {
  const links = [
    { href: "/ayuda", label: "Ayuda" },
    { href: "/terminos", label: "Términos" },
    { href: "/privacidad", label: "Privacidad" },
    { href: "/cookies", label: "Cookies" },
    { href: "/devoluciones", label: "Devoluciones" },
    { href: "/entrega", label: "Entrega" },
    { href: "/seguridad", label: "Seguridad" },
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
