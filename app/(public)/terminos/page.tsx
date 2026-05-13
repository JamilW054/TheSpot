import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones — Buxxep",
  description: "Lee los términos y condiciones de uso de la plataforma Buxxep.",
};

const LAST_UPDATED = "13 de mayo de 2026";

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
          Última actualización: {LAST_UPDATED}
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">

        <Section title="1. Aceptación de los términos">
          <p>
            Al acceder y utilizar la plataforma Buxxep (en adelante "el Servicio"), accesible en{" "}
            <a href="https://buxxep.vercel.app" className="text-primary hover:underline">
              buxxep.vercel.app
            </a>
            , aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con
            alguna parte de estos términos, no podrás utilizar el Servicio.
          </p>
        </Section>

        <Section title="2. Descripción del servicio">
          <p>
            Buxxep es una plataforma de comercio electrónico de moda personalizada con sede en la
            República Dominicana. Ofrecemos:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>Editor en línea para crear diseños personalizados en prendas de vestir.</li>
            <li>Catálogo de productos de streetwear (camisetas, hoodies y más).</li>
            <li>Procesamiento de pedidos y entrega en territorio dominicano.</li>
          </ul>
        </Section>

        <Section title="3. Cuentas de usuario">
          <p>
            Para realizar compras debes crear una cuenta proporcionando un correo electrónico válido
            y una contraseña. Eres responsable de mantener la confidencialidad de tus credenciales y
            de toda actividad que ocurra bajo tu cuenta. Debes notificarnos de inmediato ante
            cualquier uso no autorizado.
          </p>
          <p className="mt-3">
            Buxxep se reserva el derecho de suspender o cancelar cuentas que violen estos términos o
            que sean utilizadas de forma fraudulenta.
          </p>
        </Section>

        <Section title="4. Pedidos y pagos">
          <p>
            Al realizar un pedido aceptas pagar el precio indicado más los costos de envío
            aplicables. Los precios están expresados en pesos dominicanos (DOP) e incluyen el ITBIS
            cuando corresponda.
          </p>
          <p className="mt-3">
            Los pagos se procesan a través de <strong className="text-foreground">Azul</strong>,
            procesador de pagos autorizado en la República Dominicana. Buxxep no almacena datos de
            tarjetas bancarias.
          </p>
          <p className="mt-3">
            Un pedido se considera confirmado únicamente cuando el pago es aprobado por la pasarela
            de pago.
          </p>
        </Section>

        <Section title="5. Producción y tiempos de entrega">
          <p>
            Los productos personalizados son fabricados bajo pedido. Los tiempos estimados de
            entrega son:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              <strong className="text-foreground">Producción:</strong> 3 a 7 días hábiles.
            </li>
            <li>
              <strong className="text-foreground">Entrega en Santo Domingo:</strong> 1 a 2 días
              hábiles.
            </li>
            <li>
              <strong className="text-foreground">Entrega en el interior del país:</strong> 3 a 5
              días hábiles.
            </li>
          </ul>
          <p className="mt-3">
            Estos tiempos son estimados y pueden variar por causas ajenas a Buxxep.
          </p>
        </Section>

        <Section title="6. Propiedad intelectual">
          <p>
            Al subir o crear un diseño en nuestra plataforma, declaras que posees los derechos
            necesarios sobre dicho contenido o tienes permiso para usarlo. Buxxep no se
            responsabiliza por infracciones de derechos de autor cometidas por los usuarios.
          </p>
          <p className="mt-3">
            La marca Buxxep, el logotipo, el software y los contenidos propios de la plataforma son
            propiedad exclusiva de Buxxep y están protegidos por las leyes de propiedad intelectual
            de la República Dominicana.
          </p>
        </Section>

        <Section title="7. Conducta del usuario">
          <p>Queda prohibido utilizar el Servicio para:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>Publicar contenido ofensivo, difamatorio, obsceno o ilegal.</li>
            <li>Infringir derechos de terceros.</li>
            <li>Intentar acceder sin autorización a sistemas o cuentas ajenas.</li>
            <li>Realizar actividades que puedan dañar, deshabilitar o sobrecargar el Servicio.</li>
          </ul>
        </Section>

        <Section title="8. Limitación de responsabilidad">
          <p>
            En la medida máxima permitida por la ley dominicana, Buxxep no será responsable por
            daños indirectos, incidentales, especiales o consecuentes derivados del uso o la
            imposibilidad de uso del Servicio.
          </p>
        </Section>

        <Section title="9. Modificaciones">
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
            entrarán en vigor al publicarse en esta página. El uso continuado del Servicio después
            de publicados los cambios constituye la aceptación de los nuevos términos.
          </p>
        </Section>

        <Section title="10. Ley aplicable y jurisdicción">
          <p>
            Estos términos se rigen por las leyes de la República Dominicana. Cualquier disputa
            derivada de su interpretación o ejecución será resuelta ante los tribunales competentes
            de Santo Domingo, República Dominicana.
          </p>
        </Section>

        <Section title="11. Contacto">
          <p>
            Para consultas sobre estos términos puedes contactarnos en Instagram{" "}
            <a href="https://instagram.com/buxxep" className="text-primary hover:underline">
              @buxxep
            </a>
            .
          </p>
        </Section>

      </div>

      <LegalNav current="terminos" />
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
