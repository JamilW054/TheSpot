import type { Metadata } from "next";
import Link from "next/link";
import { ORDER_STATUS_PAGE } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Centro de Ayuda — Buxxep",
  description:
    "Respuestas a las preguntas más frecuentes sobre pedidos, pagos, envíos, devoluciones y cuentas en Buxxep, más los canales de contacto directo con soporte.",
};

const LAST_UPDATED = "25 de julio de 2026";
const SUPPORT_EMAIL = "soportebuxxep@gmail.com";
const SUPPORT_PHONE = "809-828-9979";
const INSTAGRAM_HANDLE = "@buxxep";
const INSTAGRAM_URL = "https://instagram.com/buxxep";

export default function AyudaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
          Ayuda
        </p>
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Centro de Ayuda
        </h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: {LAST_UPDATED}
        </p>
      </div>

      {/* Highlight box — contacto directo */}
      <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm text-foreground">
          <strong>¿Necesitas ayuda rápido?</strong> Escríbenos a{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-primary hover:underline underline-offset-2"
          >
            {SUPPORT_EMAIL}
          </a>
          , llámanos al{" "}
          <a
            href={`tel:+1${SUPPORT_PHONE.replace(/-/g, "")}`}
            className="text-primary hover:underline underline-offset-2"
          >
            {SUPPORT_PHONE}
          </a>{" "}
          o escríbenos por Instagram{" "}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline underline-offset-2"
          >
            {INSTAGRAM_HANDLE}
          </a>
          . Respondemos en días hábiles.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <Section title="¿Cómo hago un pedido?">
          <p>
            Explora el{" "}
            <Link
              href="/catalogo"
              className="text-primary hover:underline underline-offset-2"
            >
              catálogo
            </Link>
            , elige el producto, la variante y la talla que quieras, agrégalo
            al carrito y completa el pago. Un pedido queda confirmado
            únicamente cuando el pago es aprobado.
          </p>
        </Section>

        <Section title="¿Qué métodos de pago aceptan?">
          <p>
            Aceptamos tarjetas Visa, Mastercard, Maestro, American Express,
            Discover, Diners Club y JCB, además de Apple Pay y Google Pay. Los
            pagos se procesan a través de AZUL con cifrado TLS y autenticación
            3D Secure; Buxxep no almacena datos de tu tarjeta. Más detalles en{" "}
            <Link
              href="/seguridad"
              className="text-primary hover:underline underline-offset-2"
            >
              Seguridad de Datos
            </Link>
            .
          </p>
        </Section>

        <Section title="¿Cuánto tarda mi pedido en llegar?">
          <p>
            Los pedidos se fabrican en un plazo de 3 a 5 días hábiles y el
            envío dentro de la República Dominicana toma entre 2 y 5 días
            hábiles adicionales, según tu ubicación. El tiempo total estimado
            es de 5 a 10 días hábiles. Consulta{" "}
            <Link
              href="/entrega"
              className="text-primary hover:underline underline-offset-2"
            >
              Política de Entrega
            </Link>{" "}
            para más información.
          </p>
        </Section>

        <Section title="¿Cómo rastreo el estado de mi pedido?">
          <p>
            Puedes consultarlo en{" "}
            <Link
              href={ORDER_STATUS_PAGE.href}
              className="text-primary hover:underline underline-offset-2"
            >
              {ORDER_STATUS_PAGE.label}
            </Link>{" "}
            o, si iniciaste sesión, desde{" "}
            <Link
              href="/cuenta/pedidos"
              className="text-primary hover:underline underline-offset-2"
            >
              Mis pedidos
            </Link>
            .
          </p>
        </Section>

        <Section title="¿Puedo cambiar o devolver un producto?">
          <p>
            Sí, dentro de los 7 días calendario posteriores a la recepción,
            siempre que el producto tenga defectos de fabricación o no
            corresponda a lo ordenado. Los productos personalizados no tienen
            devolución salvo error nuestro. Revisa el procedimiento completo
            en{" "}
            <Link
              href="/devoluciones"
              className="text-primary hover:underline underline-offset-2"
            >
              Política de Devoluciones
            </Link>
            .
          </p>
        </Section>

        <Section title="Olvidé mi contraseña, ¿qué hago?">
          <p>
            En la pantalla de{" "}
            <Link
              href="/login"
              className="text-primary hover:underline underline-offset-2"
            >
              inicio de sesión
            </Link>{" "}
            selecciona "Olvidé mi contraseña" para recibir un enlace de
            recuperación por correo electrónico.
          </p>
        </Section>

        <Section title="¿Cómo elimino mi cuenta?">
          <p>
            Desde la app, en Perfil &gt; Configuración &gt; Eliminar Cuenta.
            Tu cuenta entra en un período de recuperación de 30 días antes de
            eliminarse de forma definitiva. Detalles completos en{" "}
            <Link
              href="/eliminar-cuenta"
              className="text-primary hover:underline underline-offset-2"
            >
              Eliminar Cuenta
            </Link>
            .
          </p>
        </Section>

        <Section title="¿Mis datos personales y de pago están seguros?">
          <p>
            Toda la comunicación viaja cifrada por HTTPS/TLS, las contraseñas
            se almacenan con hash y los pagos se procesan directamente en los
            servidores de AZUL, certificados PCI-DSS. Más información en{" "}
            <Link
              href="/seguridad"
              className="text-primary hover:underline underline-offset-2"
            >
              Seguridad de Datos
            </Link>{" "}
            y{" "}
            <Link
              href="/privacidad"
              className="text-primary hover:underline underline-offset-2"
            >
              Política de Privacidad
            </Link>
            .
          </p>
        </Section>

        <Section title="Contacto directo">
          <p>Si no encontraste respuesta a tu pregunta, escríbenos:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              Correo:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary hover:underline underline-offset-2"
              >
                {SUPPORT_EMAIL}
              </a>
            </li>
            <li>
              Teléfono:{" "}
              <a
                href={`tel:+1${SUPPORT_PHONE.replace(/-/g, "")}`}
                className="text-primary hover:underline underline-offset-2"
              >
                {SUPPORT_PHONE}
              </a>
            </li>
            <li>
              Instagram:{" "}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-2"
              >
                {INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
        </Section>
      </div>

      <LegalNav current="ayuda" />
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
    { href: "/eliminar-cuenta", label: "Eliminar cuenta" },
  ];
  return (
    <div className="mt-12 border-t border-border pt-8">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Otras páginas
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
