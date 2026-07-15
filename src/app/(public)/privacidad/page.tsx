import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad — Buxxep",
  description:
    "Conoce cómo Buxxep recopila, usa, comparte y protege tu información personal, y los derechos que tienes sobre tus datos.",
  alternates: { canonical: "https://buxxep.com/privacidad" },
};

const LAST_UPDATED = "15 de julio de 2026";
const VERSION = "v1.0";
const SUPPORT_EMAIL = "soportebuxxep@gmail.com";
const SUPPORT_PHONE = "809-828-9979";

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
            BUXXEP es una plataforma de comercio electrónico operada desde la
            República Dominicana y disponible en Latinoamérica, con aplicación
            móvil (iOS y Android) y sitio web. Esta política explica qué datos
            personales tratamos y con qué fines. Para cualquier consulta,
            escríbenos a{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-primary hover:underline underline-offset-2"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            o llámanos al{" "}
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
            <strong className="text-foreground">
              Datos que nos facilitas:
            </strong>
          </p>
          <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Cuenta y perfil:</strong>{" "}
              nombre de usuario, nombre completo, foto de avatar (almacenada en
              Cloudflare R2), teléfono y rol. El correo electrónico y la
              contraseña (con hashing) los gestiona Supabase Auth.
            </li>
            <li>
              <strong className="text-foreground">Direcciones:</strong> nombre,
              apellido, dirección (línea 1 y 2), ciudad, estado o provincia,
              código postal, país y teléfono.
            </li>
            <li>
              <strong className="text-foreground">Pedidos:</strong> productos,
              cantidades, variantes y tallas, precios, dirección de envío
              (copia), correo de contacto, notas, código de seguimiento y fecha
              estimada de entrega.
            </li>
            <li>
              <strong className="text-foreground">Pagos:</strong> referencias de
              cada transacción (identificador, código de autorización, monto,
              moneda y estado). Los pagos se procesan con la pasarela AZUL
              (Servicios Digitales Popular), que cumple PCI-DSS.{" "}
              <strong className="text-foreground">
                BUXXEP no almacena el número de tarjeta ni el CVV.
              </strong>
            </li>
            <li>
              <strong className="text-foreground">Verificación (OTP):</strong>{" "}
              correo, código de un solo uso y dirección IP del solicitante.
            </li>
            <li>
              <strong className="text-foreground">
                Actividad en la plataforma:
              </strong>{" "}
              reseñas, lista de deseos, carrito, notificaciones y tokens de
              dispositivo para notificaciones push, y los diseños que creas.
            </li>
            <li>
              <strong className="text-foreground">Imágenes:</strong> avatares y
              archivos que eliges desde la cámara, galería o almacenamiento del
              dispositivo para crear diseños. Solo accedemos a los archivos que
              seleccionas.
            </li>
          </ul>
          <p className="mt-4">
            <strong className="text-foreground">
              Datos que recopilamos automáticamente:
            </strong>{" "}
            dirección IP, información técnica necesaria para la seguridad y
            tokens de sesión. No utilizamos analítica de pantallas, búsquedas o
            productos vistos mientras no esté implementada.
          </p>
        </Section>

        <Section title="2. Finalidad del tratamiento">
          <p>Utilizamos tus datos para:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>Crear y gestionar tu cuenta y autenticar tu identidad.</li>
            <li>Procesar, cobrar y entregar tus pedidos.</li>
            <li>Enviarte notificaciones sobre el estado de tus pedidos.</li>
            <li>Gestionar cupones y descuentos.</li>
            <li>Brindarte soporte y atención al cliente.</li>
            <li>Garantizar la seguridad y prevenir el fraude.</li>
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
              de datos PostgreSQL y autenticación (servidores en EE. UU.).
            </li>
            <li>
              <strong className="text-foreground">Cloudflare R2</strong> —
              almacenamiento de imágenes y avatares.
            </li>
            <li>
              <strong className="text-foreground">
                AZUL (Servicios Digitales Popular)
              </strong>{" "}
              — procesamiento de pagos (cumple PCI-DSS).
            </li>
            <li>
              <strong className="text-foreground">
                Proveedores de logística y mensajería
              </strong>{" "}
              — para entregar tus pedidos.
            </li>
            <li>
              <strong className="text-foreground">
                Proveedores de correo y notificaciones
              </strong>{" "}
              — para enviarte avisos transaccionales y push.
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
              <strong className="text-foreground">Supresión:</strong> eliminar
              tu cuenta y datos personales.
            </li>
            <li>
              <strong className="text-foreground">Portabilidad:</strong> recibir
              tus datos en un formato estructurado.
            </li>
            <li>
              <strong className="text-foreground">Oposición:</strong> oponerte a
              ciertos tratamientos.
            </li>
            <li>
              <strong className="text-foreground">Limitación:</strong>{" "}
              restringir el tratamiento en determinadas circunstancias.
            </li>
          </ul>
        </Section>

        <Section title="5. Retención y eliminación de datos">
          <p>
            Conservamos tus datos mientras tu cuenta esté activa. Cuando
            solicitas eliminar tu cuenta, esta se marca como eliminada y se
            inicia un período de recuperación de 30 días: si inicias sesión
            nuevamente con el mismo correo dentro de ese plazo, tu cuenta se
            restaura. Pasados los 30 días, tu cuenta y tus datos personales se
            eliminan de forma permanente.
          </p>
          <p className="mt-3">
            Conservamos los comprobantes de compras y pagos (pedidos y
            transacciones) aun después de eliminar la cuenta, cuando lo exijan
            obligaciones fiscales, contables o de prevención de fraude. Consulta
            el procedimiento completo en{" "}
            <Link
              href="/eliminar-cuenta"
              className="text-primary hover:underline underline-offset-2"
            >
              Eliminar Cuenta
            </Link>
            .
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
            Aplicamos medidas técnicas y organizativas para proteger tus datos:
            cifrado en tránsito (HTTPS/TLS), almacenamiento de contraseñas con
            hashing, aislamiento de la información por usuario, control de
            acceso por roles y la no conservación de números de tarjeta ni CVV.
          </p>
        </Section>

        <Section title="8. Privacidad de menores">
          <p>
            BUXXEP no está dirigido a menores de 18 años y no recopilamos
            conscientemente datos de menores. Si detectamos que hemos recopilado
            datos de un menor, los eliminaremos.
          </p>
        </Section>

        <Section title="9. Cambios a esta política">
          <p>
            Podemos actualizar esta Política de Privacidad. Publicaremos la
            versión vigente en esta página y, ante cambios significativos, te lo
            notificaremos por los medios disponibles. Esta política se rige por
            las leyes de la República Dominicana.
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
