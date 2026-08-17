import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Entrega — JW PARFUM",
  description:
    "Conoce los plazos, zonas y condiciones de entrega de tus pedidos en JW PARFUM.",
};

const LAST_UPDATED = "16 de agosto de 2026";
const SUPPORT_EMAIL = "jamilwilliams054@gmail.com";
const SUPPORT_PHONE = "809-761-2875";

export default function EntregaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Política de Entrega
        </h1>
        <p className="text-sm text-muted-foreground">Última actualización: {LAST_UPDATED}</p>
      </div>

      {/* Highlight box */}
      <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm text-foreground">
          <strong>Resumen:</strong> Nuestros perfumes están en inventario, listos para enviar. Tras
          confirmar tu pedido por WhatsApp, coordinamos la entrega — normalmente{" "}
          <strong>1 a 3 días hábiles</strong> según tu ubicación dentro de la República Dominicana.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">

        <Section title="1. Zonas de entrega">
          <p>
            Actualmente realizamos entregas en toda la{" "}
            <strong className="text-foreground">República Dominicana</strong>. No realizamos envíos
            internacionales por el momento.
          </p>
        </Section>

        <Section title="2. Cómo se coordina la entrega">
          <p>
            No hay pago en línea: al confirmar tu pedido en el sitio, te
            contactamos por WhatsApp para coordinar contigo el método de pago,
            la dirección exacta y el horario de entrega.
          </p>
        </Section>

        <Section title="3. Tiempo de entrega estimado">
          <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Gran Santo Domingo:</strong> 1 a 2 días hábiles.
            </li>
            <li>
              <strong className="text-foreground">Santiago y otras ciudades principales:</strong>{" "}
              2 a 3 días hábiles.
            </li>
            <li>
              <strong className="text-foreground">Provincias y zonas rurales:</strong>{" "}
              3 a 5 días hábiles.
            </li>
          </ul>
          <p className="mt-2">
            Los días hábiles no incluyen sábados, domingos ni feriados nacionales.
          </p>
        </Section>

        <Section title="4. Costos de envío">
          <p>
            El costo de envío depende del método elegido durante el checkout y
            se muestra claramente en el carrito antes de confirmar tu pedido.
          </p>
        </Section>

        <Section title="5. Confirmación y seguimiento del pedido">
          <ol className="mt-3 list-inside list-decimal space-y-2 pl-2">
            <li>
              Al confirmar tu pedido recibirás un{" "}
              <strong className="text-foreground">correo con el resumen</strong> y tu número de
              pedido.
            </li>
            <li>Te escribiremos por WhatsApp para coordinar el pago y la entrega.</li>
            <li>
              Puedes consultar el estado de tu pedido en cualquier momento en{" "}
              <Link href="/estado-pedido" className="text-primary hover:underline">
                Estado del pedido
              </Link>
              .
            </li>
          </ol>
        </Section>

        <Section title="6. Condiciones de entrega">
          <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
            <li>
              Asegúrate de que la dirección proporcionada sea completa y correcta (calle, número,
              sector, ciudad y referencia si aplica).
            </li>
            <li>
              Debe haber una persona disponible para recibir el paquete en el horario coordinado.
            </li>
            <li>
              JW PARFUM no se hace responsable por demoras causadas por información de dirección
              incorrecta o incompleta.
            </li>
          </ul>
        </Section>

        <Section title="7. Pedido no entregado">
          <p>
            Si tu pedido no llega dentro del plazo coordinado, contáctanos de inmediato:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              Correo:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </li>
            <li>
              WhatsApp:{" "}
              <a href={`tel:+1${SUPPORT_PHONE.replace(/-/g, "")}`} className="text-primary hover:underline">
                {SUPPORT_PHONE}
              </a>
            </li>
          </ul>
        </Section>

        <Section title="8. Daños durante el transporte">
          <p>
            Si tu pedido llega visiblemente dañado, consulta nuestra{" "}
            <Link href="/devoluciones" className="text-primary hover:underline">
              Política de Devoluciones
            </Link>{" "}
            para conocer los pasos a seguir. Repórtalo dentro de las{" "}
            <strong className="text-foreground">48 horas</strong> siguientes a la recepción.
          </p>
        </Section>

      </div>

      <LegalNav current="entrega" />
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
