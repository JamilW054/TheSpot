import type { Metadata } from "next";
import Link from "next/link";
import { DeleteAccountButton } from "./DeleteAccountButton";

export const metadata: Metadata = {
  title: "Eliminar Cuenta — Buxxep",
  description:
    "Cómo eliminar tu cuenta de Buxxep y el período de recuperación de 30 días antes de la eliminación definitiva de tus datos.",
  alternates: { canonical: "https://buxxep.com/eliminar-cuenta" },
};

const LAST_UPDATED = "15 de julio de 2026";
const VERSION = "v1.0";
const SUPPORT_EMAIL = "soportebuxxep@gmail.com";
const SUPPORT_PHONE = "809-828-9979";

export default function EliminarCuentaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
          Cuenta
        </p>
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Eliminar Cuenta
        </h1>
        <p className="text-sm text-muted-foreground">
          Versión {VERSION} · Última actualización: {LAST_UPDATED}
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        {/* ── Parte A: resumen ── */}
        <section className="rounded-[14px] border border-border bg-card p-5 sm:p-6">
          <p className="text-foreground">
            Puede eliminar su cuenta directamente desde la aplicación.
          </p>
          <p className="mt-2">
            Ruta:{" "}
            <strong className="text-foreground">
              Perfil &gt; Configuración &gt; Eliminar Cuenta
            </strong>
          </p>
          <p className="mt-4 font-medium text-foreground">
            Al eliminar la cuenta:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
            <li>Se cerrará su sesión.</li>
            <li>Sus datos personales dejarán de estar disponibles.</li>
            <li>
              Algunos registros de compras o facturación podrán conservarse
              cuando la ley lo requiera.
            </li>
            <li>
              Si elimina su cuenta por error, puede contactar al soporte durante
              el período de recuperación.
            </li>
          </ul>
        </section>

        {/* ── Eliminación desde la web (usuarios autenticados) ── */}
        <DeleteAccountButton />

        <section className="rounded-[14px] border border-border bg-card p-5 sm:p-6">
          <h2 className="mb-3 text-base font-semibold text-foreground">
            Solicitud sin acceso a la aplicación
          </h2>
          <p>
            Si desinstalaste la aplicación o no puedes iniciar sesión, puedes
            solicitar la eliminación sin volver a instalarla. Escríbenos desde
            el correo asociado a tu cuenta con el asunto “Solicitud de
            eliminación de cuenta Buxxep”. Verificaremos tu identidad y
            procesaremos la solicitud en un plazo máximo de 30 días.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Solicitud%20de%20eliminaci%C3%B3n%20de%20cuenta%20Buxxep`}
            className="mt-4 inline-flex rounded-[10px] bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90"
          >
            Solicitar eliminación por correo
          </a>
        </section>

        {/* ── Parte B: política detallada ── */}
        <Section title="Cómo funciona la eliminación">
          <p>
            Cuando un usuario solicita eliminar su cuenta, esta se marca como
            eliminada y se inicia un período de retención de 30 días. Durante
            ese período, el usuario puede restaurar su cuenta iniciando sesión
            nuevamente con el mismo correo electrónico y verificando su
            identidad. Una vez transcurridos los 30 días, la cuenta y los datos
            personales asociados se eliminan de forma permanente, salvo aquellos
            registros que deban conservarse por obligaciones legales, fiscales o
            de prevención de fraude. Este proceso permite recuperar cuentas
            eliminadas por error y garantizar el cumplimiento de los requisitos
            de las plataformas de distribución de aplicaciones.
          </p>
        </Section>

        <Section title="Datos que se conservan">
          <p>
            Por obligaciones legales, fiscales y de prevención de fraude,
            conservamos los comprobantes de tus compras (pedidos y transacciones
            de pago) aunque elimines tu cuenta. El resto de tus datos personales
            (direcciones, carrito, lista de deseos, reseñas, diseños,
            notificaciones y tokens de dispositivo) se eliminan al finalizar el
            período de recuperación. Consulta la{" "}
            <Link
              href="/privacidad"
              className="text-primary hover:underline underline-offset-2"
            >
              Política de Privacidad
            </Link>{" "}
            para más detalles.
          </p>
        </Section>

        <Section title="Contacto de soporte">
          <p>
            ¿Eliminaste tu cuenta por error o necesitas ayuda? Escríbenos
            durante el período de recuperación:
          </p>
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

      <LegalNav current="eliminar-cuenta" />
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
