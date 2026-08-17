import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Devoluciones — The Spot",
  description:
    "Conoce nuestra política de devoluciones, cambios y reembolsos en The Spot.",
};

const LAST_UPDATED = "16 de agosto de 2026";
const SUPPORT_EMAIL = "jamilwilliams054@gmail.com";
const SUPPORT_PHONE = "809-761-2875";

export default function DevolucionesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
          Legal
        </p>
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Política de Devoluciones
        </h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: {LAST_UPDATED}
        </p>
      </div>

      {/* Highlight box */}
      <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm text-foreground">
          <strong>Resumen:</strong> Aceptamos devoluciones y cambios dentro de
          los <strong>7 días calendario</strong> posteriores a la recepción del
          pedido, siempre que el producto llegue sin usar, con empaque original,
          o presente un defecto de fabricación o una diferencia con lo ordenado.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <Section title="1. Productos elegibles para devolución">
          <p>Aceptamos devoluciones únicamente cuando:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              El producto llega sin usar, con etiquetas y empaque original.
            </li>
            <li>El producto llegó con defectos de fabricación visibles.</li>
            <li>
              El producto recibido no corresponde al modelo, talla o tamaño
              ordenado.
            </li>
            <li>
              El pedido llegó incompleto o se entregó el producto equivocado.
            </li>
          </ul>
        </Section>

        <Section title="2. Productos NO elegibles para devolución">
          <p>
            Por razones de higiene,{" "}
            <strong className="text-foreground">
              no aceptamos devoluciones
            </strong>{" "}
            de:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              Productos de belleza o perfume abiertos, usados o con el sello de
              seguridad roto (salvo defecto de fábrica).
            </li>
            <li>Prendas, gorras o tenis usados, lavados o sin etiquetas.</li>
            <li>
              Arrepentimiento de compra o cambio de opinión una vez usado el
              producto.
            </li>
          </ul>
        </Section>

        <Section title="3. Plazo para solicitar devolución o cambio">
          <p>
            Tienes{" "}
            <strong className="text-foreground">7 días calendario</strong> desde
            la fecha en que recibiste el pedido para contactarnos y solicitar
            una devolución o cambio. Pasado este plazo no podremos procesar la
            solicitud.
          </p>
        </Section>

        <Section title="4. Cómo solicitar una devolución">
          <p>Para iniciar una solicitud:</p>
          <ol className="mt-3 list-inside list-decimal space-y-2 pl-2">
            <li>
              Escríbenos al{" "}
              <a
                href={`tel:+1${SUPPORT_PHONE.replace(/-/g, "")}`}
                className="text-primary hover:underline"
              >
                {SUPPORT_PHONE}
              </a>{" "}
              o por correo a{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-primary hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              dentro del plazo de 7 días.
            </li>
            <li>
              Indica tu número de pedido y describe el problema detalladamente.
            </li>
            <li>Adjunta fotografías claras del producto y el empaque.</li>
            <li>Te responderemos en un plazo máximo de 48 horas hábiles.</li>
          </ol>
        </Section>

        <Section title="5. Proceso de cambio">
          <p>
            Si tu solicitud es aprobada, coordinamos contigo el cambio por el
            mismo producto o uno equivalente, sin costo adicional si el error
            fue nuestro.
          </p>
        </Section>

        <Section title="6. Reembolsos">
          <p>
            Los reembolsos solo aplican cuando no es posible realizar un cambio.
            Como no procesamos pagos en línea, el reembolso se coordina
            directamente contigo por el mismo medio en que se acordó el pago
            original.
          </p>
        </Section>

        <Section title="7. Envíos dañados">
          <p>
            Si tu pedido llegó dañado durante el transporte, contáctanos dentro
            de las <strong className="text-foreground">48 horas</strong>{" "}
            siguientes a la recepción con fotografías del empaque y del
            producto. Te enviaremos un reemplazo lo antes posible.
          </p>
        </Section>

        <Section title="8. Contacto">
          <p>
            Para cualquier consulta sobre esta política o para iniciar una
            solicitud, escríbenos al{" "}
            <a
              href={`tel:+1${SUPPORT_PHONE.replace(/-/g, "")}`}
              className="text-primary hover:underline"
            >
              {SUPPORT_PHONE}
            </a>{" "}
            o por correo a{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
            . Respondemos en días hábiles.
          </p>
        </Section>
      </div>

      <LegalNav current="devoluciones" />
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
