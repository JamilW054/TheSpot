import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Entrega — Buxxep",
  description:
    "Conoce los plazos, costos y condiciones de envío de tus pedidos en Buxxep.",
};

const LAST_UPDATED = "16 de mayo de 2026";

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
          <strong>Resumen:</strong> Los pedidos se procesan y fabrican en un plazo de{" "}
          <strong>3 a 5 días hábiles</strong>. El envío dentro de la República Dominicana toma
          entre <strong>2 y 5 días hábiles</strong> adicionales según tu ubicación. El tiempo
          total estimado desde la compra hasta la entrega es de{" "}
          <strong>5 a 10 días hábiles</strong>.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">

        <Section title="1. Zonas de entrega">
          <p>
            Actualmente realizamos entregas en toda la{" "}
            <strong className="text-foreground">República Dominicana</strong>. No realizamos envíos
            internacionales por el momento.
          </p>
          <p className="mt-2">
            Las zonas de entrega disponibles se mostrarán durante el proceso de compra al ingresar
            tu dirección. Si tu ubicación no está cubierta, te lo notificaremos antes de completar
            el pago.
          </p>
        </Section>

        <Section title="2. Tiempo de procesamiento y fabricación">
          <p>
            Nuestros productos son fabricados bajo pedido con el diseño personalizado que
            seleccionaste. Una vez confirmado el pago, el tiempo de producción es de:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              <strong className="text-foreground">3 a 5 días hábiles</strong> para la mayoría de
              productos (camisetas, polos, hoodies).
            </li>
            <li>
              Pedidos con múltiples unidades o diseños complejos pueden requerir hasta{" "}
              <strong className="text-foreground">7 días hábiles</strong>.
            </li>
          </ul>
          <p className="mt-2">
            Los días hábiles no incluyen sábados, domingos ni feriados nacionales dominicanos.
          </p>
        </Section>

        <Section title="3. Tiempo de envío">
          <p>
            Una vez que tu pedido esté listo y entregado a la empresa de mensajería, el tiempo de
            entrega estimado es:
          </p>
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
        </Section>

        <Section title="4. Costos de envío">
          <p>
            El costo de envío se calcula según tu dirección de entrega y se muestra claramente
            durante el proceso de pago antes de confirmar tu orden.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>Los costos de envío están sujetos a cambios según el servicio de mensajería.</li>
            <li>
              En caso de promociones de envío gratis, se indicará claramente en la tienda y en el
              carrito de compras.
            </li>
          </ul>
        </Section>

        <Section title="5. Confirmación y seguimiento del pedido">
          <p>
            Una vez que tu pago sea procesado exitosamente:
          </p>
          <ol className="mt-3 list-inside list-decimal space-y-2 pl-2">
            <li>
              Recibirás un <strong className="text-foreground">correo de confirmación</strong> con
              el resumen de tu pedido y número de orden.
            </li>
            <li>
              Cuando tu pedido sea enviado, recibirás un correo con el{" "}
              <strong className="text-foreground">número de rastreo</strong> de la empresa de
              mensajería.
            </li>
            <li>
              Puedes consultar el estado de tu pedido en cualquier momento en la sección{" "}
              <Link href="/estado-pedido" className="text-primary hover:underline">
                Estado del pedido
              </Link>
              .
            </li>
          </ol>
        </Section>

        <Section title="6. Condiciones de entrega">
          <p>Para garantizar una entrega exitosa:</p>
          <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
            <li>
              Asegúrate de que la dirección ingresada sea completa y correcta (calle, número,
              sector, ciudad y referencia si aplica).
            </li>
            <li>
              Debe haber una persona disponible para recibir el paquete. Si no hay nadie en el
              domicilio, la empresa de mensajería dejará un aviso e intentará una segunda entrega.
            </li>
            <li>
              Buxxep no se hace responsable por demoras causadas por información de dirección
              incorrecta o incompleta proporcionada por el cliente.
            </li>
          </ul>
        </Section>

        <Section title="7. Pedido perdido o no entregado">
          <p>
            Si tu pedido no llega dentro del plazo máximo estimado o el rastreo muestra un estado
            inusual, contáctanos de inmediato:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              Correo:{" "}
              <a href="mailto:soporte@buxxep.com" className="text-primary hover:underline">
                soporte@buxxep.com
              </a>
            </li>
            <li>
              Teléfono: <a href="tel:+18095550000" className="text-primary hover:underline">+1 (809) 555-0000</a>
            </li>
            <li>
              Instagram:{" "}
              <a
                href="https://instagram.com/buxxep"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @buxxep
              </a>
            </li>
          </ul>
          <p className="mt-2">
            Investigaremos el caso con la empresa de mensajería y te mantendremos informado.
            Si el paquete se confirma como perdido por causa atribuible al transportista,
            procederemos a reenviar el pedido sin costo adicional.
          </p>
        </Section>

        <Section title="8. Daños durante el transporte">
          <p>
            Si tu pedido llega visiblemente dañado, consulta nuestra{" "}
            <Link href="/devoluciones" className="text-primary hover:underline">
              Política de Devoluciones
            </Link>{" "}
            para conocer los pasos a seguir. Deberás reportarlo dentro de las{" "}
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
