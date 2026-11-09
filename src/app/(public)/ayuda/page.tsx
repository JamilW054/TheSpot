import type { Metadata } from "next";
import Link from "next/link";
import { ORDER_STATUS_PAGE } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Centro de Ayuda",
  description:
    "Respuestas a las preguntas más frecuentes sobre pedidos, entrega y devoluciones en The Spot, más los canales de contacto directo.",
};

const LAST_UPDATED = "16 de agosto de 2026";
const SUPPORT_EMAIL = "jamilwilliams054@gmail.com";
const SUPPORT_PHONE = "809-761-2875";

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
          </a>{" "}
          o al{" "}
          <a
            href={`tel:+1${SUPPORT_PHONE.replace(/-/g, "")}`}
            className="text-primary hover:underline underline-offset-2"
          >
            {SUPPORT_PHONE}
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
            , elige el producto, la talla o el tamaño, agrégalo al carrito y
            completa el checkout con tus datos de contacto. No necesitas crear
            una cuenta.
          </p>
        </Section>

        <Section title="¿Cómo pago mi pedido?">
          <p>
            Al completar el pedido queda pendiente y te contactamos por correo o
            teléfono para coordinar el pago (contra entrega o transferencia) y la
            entrega.
          </p>
        </Section>

        <Section title="¿Cuánto tarda mi pedido en llegar?">
          <p>
            Los productos están en inventario y listos para enviar. El tiempo de
            entrega dentro de la República Dominicana es de 1 a 5 días hábiles
            según tu ubicación. Consulta{" "}
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
            con el número de pedido que te dimos al confirmarlo.
          </p>
        </Section>

        <Section title="¿Puedo cambiar o devolver un producto?">
          <p>
            Sí, dentro de los 7 días calendario posteriores a la recepción,
            siempre que el artículo esté sin usar, con etiquetas y empaque
            original (los sellados de belleza y perfume no deben abrirse), o
            tenga un defecto de fabricación. Revisa el procedimiento completo en{" "}
            <Link
              href="/devoluciones"
              className="text-primary hover:underline underline-offset-2"
            >
              Política de Devoluciones
            </Link>
            .
          </p>
        </Section>

        <Section title="¿Mis datos personales están seguros?">
          <p>
            Toda la comunicación viaja cifrada por HTTPS/TLS y no procesamos
            pagos en el sitio. Más información en{" "}
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
