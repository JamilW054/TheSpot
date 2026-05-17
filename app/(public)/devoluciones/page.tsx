import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Devoluciones — Buxxep",
  description: "Conoce nuestra política de devoluciones, cambios y reembolsos en Buxxep.",
};

const LAST_UPDATED = "13 de mayo de 2026";

export default function DevolucionesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Política de Devoluciones
        </h1>
        <p className="text-sm text-muted-foreground">Última actualización: {LAST_UPDATED}</p>
      </div>

      {/* Highlight box */}
      <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm text-foreground">
          <strong>Resumen:</strong> Aceptamos devoluciones y cambios dentro de los{" "}
          <strong>7 días calendario</strong> posteriores a la recepción del pedido, siempre que el
          producto presente defectos de fabricación o diferencias con lo ordenado. Los productos
          personalizados <strong>no tienen devolución</strong> salvo error nuestro.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">

        <Section title="1. Productos elegibles para devolución">
          <p>Aceptamos devoluciones únicamente cuando:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>El producto llegó con defectos de fabricación visibles.</li>
            <li>El producto recibido no corresponde al diseño, talla o modelo ordenado.</li>
            <li>El pedido llegó incompleto o se entregó el producto equivocado.</li>
          </ul>
        </Section>

        <Section title="2. Productos NO elegibles para devolución">
          <p>
            Dado que nuestros productos son fabricados bajo pedido y personalizados según el diseño
            del cliente, <strong className="text-foreground">no aceptamos devoluciones</strong> por:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>Arrepentimiento de compra o cambio de opinión.</li>
            <li>Errores en el diseño cometidos por el cliente al momento de ordenar.</li>
            <li>Diferencias de color debido a la calibración del monitor del cliente.</li>
            <li>Uso, lavado o manipulación indebida del producto.</li>
            <li>Tallas incorrectas cuando la guía de tallas estaba disponible al comprar.</li>
          </ul>
        </Section>

        <Section title="3. Plazo para solicitar devolución o cambio">
          <p>
            Tienes <strong className="text-foreground">7 días calendario</strong> desde la fecha en
            que recibiste el pedido para contactarnos y solicitar una devolución o cambio. Pasado
            este plazo no podremos procesar la solicitud.
          </p>
        </Section>

        <Section title="4. Cómo solicitar una devolución">
          <p>Para iniciar una solicitud:</p>
          <ol className="mt-3 list-inside list-decimal space-y-2 pl-2">
            <li>
              Contáctanos vía Instagram{" "}
              <a href="https://instagram.com/buxxep" className="text-primary hover:underline">
                @buxxep
              </a>{" "}
              dentro del plazo de 7 días.
            </li>
            <li>
              Indica tu número de pedido y describe el problema detalladamente.
            </li>
            <li>
              Adjunta fotografías claras del producto defectuoso o incorrecto.
            </li>
            <li>
              Nuestro equipo evaluará tu solicitud en un plazo máximo de 48 horas hábiles.
            </li>
          </ol>
        </Section>

        <Section title="5. Proceso de cambio">
          <p>
            Si tu solicitud es aprobada, te enviaremos un producto de reemplazo sin costo adicional.
            El producto defectuoso deberá ser devuelto en su empaque original (si aplica). Los
            costos de envío del producto defectuoso de vuelta a nuestras instalaciones serán
            asumidos por Buxxep si el error fue nuestro.
          </p>
        </Section>

        <Section title="6. Reembolsos">
          <p>
            Los reembolsos monetarios solo aplican cuando no es posible realizar un cambio por el
            mismo producto. En ese caso:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              El reembolso se procesará al mismo método de pago utilizado en la compra.
            </li>
            <li>
              El tiempo de acreditación depende de tu banco (generalmente 5 a 10 días hábiles).
            </li>
            <li>
              No reembolsamos costos de envío originales salvo que el error sea 100% atribuible a
              Buxxep.
            </li>
          </ul>
        </Section>

        <Section title="7. Envíos dañados">
          <p>
            Si tu pedido llegó dañado durante el transporte, contáctanos dentro de las{" "}
            <strong className="text-foreground">48 horas</strong> siguientes a la recepción con
            fotografías del empaque y del producto. Gestionaremos el caso con el servicio de
            mensajería y te enviaremos un reemplazo lo antes posible.
          </p>
        </Section>

        <Section title="8. Contacto">
          <p>
            Para cualquier consulta sobre esta política o para iniciar una solicitud, escríbenos en
            Instagram{" "}
            <a href="https://instagram.com/buxxep" className="text-primary hover:underline">
              @buxxep
            </a>
            . Respondemos en días hábiles.
          </p>
        </Section>

      </div>

      <LegalNav current="devoluciones" />
    </div>
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
