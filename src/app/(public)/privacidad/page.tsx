import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/config/brand";

export const metadata: Metadata = {
  title: "Política de Privacidad — The Spot",
  description:
    "Conoce cómo The Spot recopila, usa y protege tu información personal al hacer un pedido.",
  alternates: { canonical: `${SITE_URL}/privacidad` },
};

const LAST_UPDATED = "16 de agosto de 2026";
const VERSION = "v1.0";
const SUPPORT_EMAIL = "jamilwilliams054@gmail.com";
const SUPPORT_PHONE = "809-761-2875";

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
          Legal
        </p>
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Política de Privacidad
        </h1>
        <p className="text-sm text-muted-foreground">
          Versión {VERSION} · Última actualización: {LAST_UPDATED}
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <p>
            The Spot es una tienda en línea operada desde la República
            Dominicana. No pedimos que crees una cuenta para comprar: solo
            tratamos los datos necesarios para procesar tu pedido de invitado.
            Esta política explica qué datos recopilamos y con qué fines. Para
            cualquier consulta, escríbenos a{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary hover:underline underline-offset-2"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            o escríbenos al{" "}
            <a
              href={`tel:+1${SUPPORT_PHONE.replace(/-/g, "")}`}
              className="text-primary hover:underline underline-offset-2"
            >
              {SUPPORT_PHONE}
            </a>
            .
          </p>
        </section>

        <Section title="1. Datos que recopilamos">
          <p>
            <strong className="text-foreground">Al hacer un pedido:</strong>
          </p>
          <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">
                Datos de contacto y entrega:
              </strong>{" "}
              nombre, correo electrónico, teléfono y dirección de entrega.
            </li>
            <li>
              <strong className="text-foreground">Detalles del pedido:</strong>{" "}
              productos elegidos, talla o tamaño, precios, cupón aplicado (si
              usaste uno) y notas que agregues.
            </li>
          </ul>
          <p className="mt-4">
            <strong className="text-foreground">
              Datos que recopilamos automáticamente:
            </strong>{" "}
            dirección IP e información técnica básica necesaria para la
            seguridad del sitio. No utilizamos analítica de terceros.
          </p>
          <p className="mt-3">
            Tu lista de favoritos y tu carrito de compra se guardan únicamente
            en tu propio navegador (localStorage) — no se envían a nuestros
            servidores hasta que confirmas un pedido.
          </p>
        </Section>

        <Section title="2. Finalidad del tratamiento">
          <p>Utilizamos tus datos para:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>Procesar y entregar tu pedido.</li>
            <li>
              Contactarte por correo o teléfono para coordinar el pago y la
              entrega.
            </li>
            <li>Aplicar cupones de descuento cuando corresponda.</li>
            <li>Brindarte soporte y atención al cliente.</li>
            <li>Prevenir el fraude y garantizar la seguridad del sitio.</li>
            <li>Cumplir obligaciones legales, fiscales y contables.</li>
          </ul>
        </Section>

        <Section title="3. Compartición con terceros">
          <p>
            <strong className="text-foreground">
              No vendemos tus datos personales.
            </strong>{" "}
            Los compartimos únicamente con los proveedores que hacen posible el
            servicio (encargados del tratamiento):
          </p>
          <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Supabase, Inc.</strong> — base
              de datos donde se registra tu pedido (servidores en EE. UU.).
            </li>
            <li>
              <strong className="text-foreground">Resend</strong> — envío del
              correo de confirmación de tu pedido.
            </li>
            <li>
              <strong className="text-foreground">Cloudflare</strong> —
              almacenamiento de las imágenes del catálogo.
            </li>
            <li>Autoridades competentes cuando la ley lo exija.</li>
          </ul>
        </Section>

        <Section title="4. Tus derechos">
          <p>
            Puedes ejercer tus derechos sobre tus datos personales
            escribiéndonos a{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary hover:underline underline-offset-2"
            >
              {SUPPORT_EMAIL}
            </a>
            :
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              <strong className="text-foreground">Acceso:</strong> conocer qué
              datos tuyos tratamos.
            </li>
            <li>
              <strong className="text-foreground">Rectificación:</strong>{" "}
              corregir datos inexactos.
            </li>
            <li>
              <strong className="text-foreground">Supresión:</strong> pedir que
              eliminemos tus datos de contacto una vez completado el pedido.
            </li>
            <li>
              <strong className="text-foreground">Oposición:</strong> oponerte a
              ciertos tratamientos.
            </li>
          </ul>
        </Section>

        <Section title="5. Retención de datos">
          <p>
            Conservamos los datos de contacto y entrega de un pedido mientras
            sea necesario para procesarlo y darte soporte al respecto, y los
            registros del pedido en sí durante el tiempo que exijan obligaciones
            fiscales o contables.
          </p>
        </Section>

        <Section title="6. Transferencias internacionales">
          <p>
            Algunos proveedores procesan datos en servidores ubicados fuera de
            la República Dominicana, principalmente en los Estados Unidos (por
            ejemplo, Supabase). En todos los casos exigimos garantías
            contractuales adecuadas para proteger tu información.
          </p>
        </Section>

        <Section title="7. Seguridad">
          <p>
            Aplicamos medidas técnicas para proteger tus datos: cifrado en
            tránsito (HTTPS/TLS) y control de acceso a la base de datos. No
            procesamos pagos en el sitio, por lo que nunca solicitamos ni
            almacenamos datos de tarjeta.
          </p>
        </Section>

        <Section title="8. Privacidad de menores">
          <p>
            The Spot no está dirigido a menores de 18 años y no recopilamos
            conscientemente datos de menores. Si detectamos que hemos recopilado
            datos de un menor, los eliminaremos.
          </p>
        </Section>

        <Section title="9. Cambios a esta política">
          <p>
            Podemos actualizar esta Política de Privacidad. Publicaremos la
            versión vigente en esta página. Esta política se rige por las leyes
            de la República Dominicana.
          </p>
        </Section>

        <Section title="Contacto">
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
      </div>

      <LegalNav current="privacidad" />
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
