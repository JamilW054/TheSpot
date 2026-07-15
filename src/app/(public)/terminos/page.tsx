import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones — Buxxep",
  description:
    "Lee los términos y condiciones de uso de la plataforma de comercio electrónico BUXXEP.",
  alternates: { canonical: "https://buxxep.com/terminos" },
};

const LAST_UPDATED = "15 de julio de 2026";
const VERSION = "v1.0";
const SUPPORT_EMAIL = "soportebuxxep@gmail.com";
const SUPPORT_PHONE = "809-828-9979";

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
            Al acceder y utilizar BUXXEP (en adelante, "el Servicio") —su sitio
            web y su aplicación móvil para iOS y Android— aceptas quedar
            vinculado por estos Términos y Condiciones. Si no estás de acuerdo
            con alguna parte, no podrás utilizar el Servicio.
          </p>
        </Section>

        <Section title="2. Descripción del servicio">
          <p>
            BUXXEP es una plataforma de comercio electrónico operada desde la
            República Dominicana y disponible en Latinoamérica. A través del
            Servicio puedes:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>Explorar el catálogo de productos y sus variantes.</li>
            <li>Realizar compras y gestionar tus pedidos.</li>
            <li>Aplicar cupones y descuentos.</li>
            <li>Hacer seguimiento de tus envíos.</li>
            <li>Guardar productos en tu lista de deseos.</li>
            <li>Administrar múltiples direcciones de entrega.</li>
          </ul>
        </Section>

        <Section title="3. Requisitos de edad">
          <p>
            Debes tener al menos 18 años para crear una cuenta y utilizar el
            Servicio. BUXXEP no está dirigido a menores de edad.
          </p>
        </Section>

        <Section title="4. Registro y responsabilidad de la cuenta">
          <p>
            Para comprar debes crear una cuenta con un correo electrónico válido
            y una contraseña. Eres responsable de mantener la confidencialidad
            de tus credenciales y de toda actividad realizada bajo tu cuenta.
            Debes notificarnos de inmediato ante cualquier uso no autorizado.
          </p>
          <p className="mt-3">
            Puedes eliminar tu cuenta en cualquier momento; revisa el
            procedimiento y el período de recuperación en{" "}
            <Link
              href="/eliminar-cuenta"
              className="text-primary hover:underline underline-offset-2"
            >
              Eliminar Cuenta
            </Link>
            . BUXXEP puede suspender o cancelar cuentas que infrinjan estos
            términos o se usen de forma fraudulenta.
          </p>
        </Section>

        <Section title="5. Proceso de compra y pagos">
          <p>
            Al realizar un pedido aceptas pagar el precio indicado más los
            costos de envío aplicables. Un pedido constituye una oferta
            vinculante de compra y se considera confirmado únicamente cuando el
            pago es aprobado.
          </p>
          <p className="mt-3">
            Los pagos se procesan a través de{" "}
            <strong className="text-foreground">
              AZUL (Servicios Digitales Popular)
            </strong>
            , pasarela que cumple el estándar PCI-DSS.{" "}
            <strong className="text-foreground">
              BUXXEP no almacena datos de tarjetas (número ni CVV).
            </strong>
          </p>
          <p className="mt-3">
            Los precios y la disponibilidad de los productos están sujetos a
            cambios sin previo aviso.
          </p>
        </Section>

        <Section title="6. Envíos y entregas">
          <p>
            Los plazos de entrega que mostramos son estimados y pueden variar
            por causas ajenas a BUXXEP. Cuando esté disponible, te
            proporcionaremos un código de seguimiento para conocer el estado de
            tu envío.
          </p>
        </Section>

        <Section title="7. Devoluciones, cancelaciones y reembolsos">
          <p>
            Las solicitudes de devolución, cancelación o reembolso se rigen por
            nuestra{" "}
            <Link
              href="/devoluciones"
              className="text-primary hover:underline underline-offset-2"
            >
              Política de Devoluciones
            </Link>
            . Los reembolsos aprobados se procesan por el mismo método de pago
            utilizado en la compra.
          </p>
        </Section>

        <Section title="8. Propiedad intelectual">
          <p>
            Al subir o crear contenido en la plataforma, declaras que posees los
            derechos necesarios o cuentas con permiso para usarlo. La marca
            BUXXEP, su logotipo, su software y los contenidos propios están
            protegidos por las leyes de propiedad intelectual de la República
            Dominicana y no pueden usarse sin autorización.
          </p>
        </Section>

        <Section title="9. Conducta del usuario">
          <p>Queda prohibido utilizar el Servicio para:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>Publicar contenido ofensivo, difamatorio, obsceno o ilegal.</li>
            <li>Infringir derechos de terceros.</li>
            <li>Acceder sin autorización a sistemas o cuentas ajenas.</li>
            <li>
              Realizar actividades que dañen, deshabiliten o sobrecarguen el
              Servicio.
            </li>
          </ul>
        </Section>

        <Section title="10. Limitación de responsabilidad">
          <p>
            En la medida máxima permitida por la ley dominicana, BUXXEP no será
            responsable por daños indirectos, incidentales, especiales o
            consecuentes derivados del uso o la imposibilidad de uso del
            Servicio.
          </p>
        </Section>

        <Section title="11. Modificaciones y ley aplicable">
          <p>
            Podemos modificar estos términos en cualquier momento; los cambios
            entran en vigor al publicarse en esta página y el uso continuado del
            Servicio implica su aceptación. Estos términos se rigen por las
            leyes de la República Dominicana, cuyos tribunales serán competentes
            para resolver cualquier disputa.
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
            · Teléfono:{" "}
            <a
              href={`tel:+1${SUPPORT_PHONE.replace(/-/g, "")}`}
              className="text-primary hover:underline underline-offset-2"
            >
              {SUPPORT_PHONE}
            </a>
          </p>
        </Section>

        <Section title="13. Privacidad y eliminación de cuenta">
          <p>
            El tratamiento de datos personales se rige por nuestra{" "}
            <Link href="/privacidad" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
            . Puedes solicitar la eliminación desde la aplicación, desde la web
            o por correo siguiendo el procedimiento de{" "}
            <Link
              href="/eliminar-cuenta"
              className="text-primary hover:underline"
            >
              Eliminación de Cuenta
            </Link>
            , sin necesidad de reinstalar la aplicación.
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
    { href: "/terminos", label: "Términos" },
    { href: "/privacidad", label: "Privacidad" },
    { href: "/cookies", label: "Cookies" },
    { href: "/devoluciones", label: "Devoluciones" },
    { href: "/entrega", label: "Entrega" },
    { href: "/seguridad", label: "Seguridad" },
    { href: "/eliminar-cuenta", label: "Eliminar cuenta" },
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
