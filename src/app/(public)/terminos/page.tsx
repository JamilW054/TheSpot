import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones — JW PARFUM",
  description:
    "Lee los términos y condiciones de uso de la tienda en línea JW PARFUM.",
  alternates: { canonical: "https://jwparfum.com/terminos" },
};

const LAST_UPDATED = "16 de agosto de 2026";
const VERSION = "v1.0";
const SUPPORT_EMAIL = "jamilwilliams054@gmail.com";
const SUPPORT_PHONE = "809-761-2875";

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
          Legal
        </p>
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Términos y Condiciones
        </h1>
        <p className="text-sm text-muted-foreground">
          Versión {VERSION} · Última actualización: {LAST_UPDATED}
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <Section title="1. Aceptación de los términos">
          <p>
            Al acceder y utilizar JW PARFUM (en adelante, "el Servicio") —nuestro
            sitio web de venta de perfumes— aceptas quedar vinculado por estos
            Términos y Condiciones. Si no estás de acuerdo con alguna parte, no
            podrás utilizar el Servicio.
          </p>
        </Section>

        <Section title="2. Descripción del servicio">
          <p>
            JW PARFUM es una perfumería en línea operada desde la República
            Dominicana. A través del Servicio puedes:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>Explorar el catálogo de perfumes por marca, categoría y tamaño.</li>
            <li>Hacer un pedido como invitado, sin necesidad de registrarte.</li>
            <li>Aplicar cupones de descuento cuando estén disponibles.</li>
            <li>Consultar el estado de tu pedido con el número que te damos al confirmarlo.</li>
          </ul>
        </Section>

        <Section title="3. Requisitos de edad">
          <p>
            Debes tener al menos 18 años para realizar compras en JW PARFUM.
          </p>
        </Section>

        <Section title="4. Pedido de invitado, sin cuenta">
          <p>
            No creamos cuentas de cliente ni pedimos contraseña: el Servicio
            funciona exclusivamente con pedido de invitado. Al hacer un pedido
            nos proporcionas los datos de contacto y entrega necesarios para
            procesarlo, y puedes consultar su estado con el número de pedido en{" "}
            <Link href="/estado-pedido" className="text-primary hover:underline">
              Estado del pedido
            </Link>
            . JW PARFUM puede negarse a procesar pedidos que se usen de forma
            fraudulenta.
          </p>
        </Section>

        <Section title="5. Proceso de compra — sin pagos en línea">
          <p>
            JW PARFUM <strong className="text-foreground">no procesa pagos en el sitio</strong>.
            Al confirmar un pedido, este queda registrado como pendiente y te
            contactamos directamente por WhatsApp para coordinar el método de
            pago y la entrega. Un pedido se considera confirmado únicamente
            cuando ambas partes acuerdan los detalles por ese medio.
          </p>
          <p className="mt-3">
            Los precios y la disponibilidad de los productos están sujetos a
            cambios sin previo aviso.
          </p>
        </Section>

        <Section title="6. Entregas">
          <p>
            Los plazos de entrega que mostramos son estimados y pueden variar
            por causas ajenas a JW PARFUM. Coordinamos la entrega directamente
            contigo al confirmar el pedido por WhatsApp.
          </p>
        </Section>

        <Section title="7. Devoluciones y cambios">
          <p>
            Las solicitudes de devolución o cambio se rigen por nuestra{" "}
            <Link
              href="/devoluciones"
              className="text-primary hover:underline underline-offset-2"
            >
              Política de Devoluciones
            </Link>
            .
          </p>
        </Section>

        <Section title="8. Propiedad intelectual">
          <p>
            La marca JW PARFUM, su logotipo y los contenidos propios del sitio
            están protegidos por las leyes de propiedad intelectual de la
            República Dominicana y no pueden usarse sin autorización.
          </p>
        </Section>

        <Section title="9. Conducta del usuario">
          <p>Queda prohibido utilizar el Servicio para:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>Publicar o transmitir contenido ofensivo, difamatorio, obsceno o ilegal.</li>
            <li>Infringir derechos de terceros.</li>
            <li>Acceder sin autorización a sistemas ajenos.</li>
            <li>
              Realizar actividades que dañen, deshabiliten o sobrecarguen el
              Servicio.
            </li>
          </ul>
        </Section>

        <Section title="10. Limitación de responsabilidad">
          <p>
            En la medida máxima permitida por la ley dominicana, JW PARFUM no
            será responsable por daños indirectos, incidentales, especiales o
            consecuentes derivados del uso o la imposibilidad de uso del
            Servicio.
          </p>
        </Section>

        <Section title="11. Modificaciones y ley aplicable">
          <p>
            Podemos modificar estos términos en cualquier momento; los cambios
            entran en vigor al publicarse en esta página. Estos términos se
            rigen por las leyes de la República Dominicana, cuyos tribunales
            serán competentes para resolver cualquier disputa.
          </p>
        </Section>

        <Section title="12. Contacto">
          <p>
            Correo:{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary hover:underline underline-offset-2"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            · WhatsApp:{" "}
            <a
              href={`tel:+1${SUPPORT_PHONE.replace(/-/g, "")}`}
              className="text-primary hover:underline underline-offset-2"
            >
              {SUPPORT_PHONE}
            </a>
          </p>
        </Section>

        <Section title="13. Privacidad">
          <p>
            El tratamiento de datos personales se rige por nuestra{" "}
            <Link href="/privacidad" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
            .
          </p>
        </Section>
      </div>

      <LegalNav current="terminos" />
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
