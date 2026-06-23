import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad — Buxxep",
  description: "Conoce cómo Buxxep recopila, usa y protege tu información personal.",
};

const LAST_UPDATED = "13 de mayo de 2026";

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Política de Privacidad
        </h1>
        <p className="text-sm text-muted-foreground">Última actualización: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">

        <Section title="1. Responsable del tratamiento">
          <p>
            Buxxep, con operaciones en la República Dominicana, es responsable del tratamiento de
            los datos personales recopilados a través de{" "}
            <a href="https://buxxep.com" className="text-primary hover:underline">
              buxxep.com
            </a>
            . Para cualquier consulta relativa a tus datos, contáctanos en{" "}
            <a href="https://instagram.com/buxxep" className="text-primary hover:underline">
              @buxxep
            </a>
            .
          </p>
        </Section>

        <Section title="2. Datos que recopilamos">
          <p>Recopilamos los siguientes tipos de información:</p>
          <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Datos de cuenta:</strong> nombre, dirección de
              correo electrónico y contraseña (encriptada).
            </li>
            <li>
              <strong className="text-foreground">Datos de pedido:</strong> dirección de entrega,
              productos adquiridos, monto pagado y referencia de transacción.
            </li>
            <li>
              <strong className="text-foreground">Diseños creados:</strong> imágenes y elementos
              guardados en el editor de diseño.
            </li>
            <li>
              <strong className="text-foreground">Datos de navegación:</strong> dirección IP, tipo
              de navegador, páginas visitadas y tiempo de sesión (mediante cookies de analítica).
            </li>
          </ul>
        </Section>

        <Section title="3. Finalidades del tratamiento">
          <p>Utilizamos tus datos para:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>Gestionar tu cuenta y autenticar tu identidad.</li>
            <li>Procesar, confirmar y entregar tus pedidos.</li>
            <li>Enviarte notificaciones transaccionales (confirmación de compra, OTP, etc.).</li>
            <li>Mejorar el funcionamiento y la experiencia de la plataforma.</li>
            <li>Cumplir con obligaciones legales y fiscales en la República Dominicana.</li>
          </ul>
        </Section>

        <Section title="4. Base jurídica">
          <p>
            El tratamiento de tus datos se fundamenta en la ejecución del contrato de compraventa,
            tu consentimiento expreso al crear una cuenta, y el cumplimiento de obligaciones legales
            aplicables en la República Dominicana (Ley No. 172-13 sobre protección de datos
            personales).
          </p>
        </Section>

        <Section title="5. Compartición de datos con terceros">
          <p>
            No vendemos ni alquilamos tu información personal. Compartimos datos únicamente con:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Azul</strong> — procesador de pagos, para
              gestionar transacciones con tarjeta.
            </li>
            <li>
              <strong className="text-foreground">Supabase</strong> — proveedor de base de datos y
              autenticación (servidores en la nube).
            </li>
            <li>
              <strong className="text-foreground">Cloudflare R2</strong> — almacenamiento de
              imágenes y diseños.
            </li>
            <li>
              <strong className="text-foreground">Resend</strong> — servicio de envío de correos
              transaccionales.
            </li>
            <li>
              Autoridades competentes cuando sea requerido por ley.
            </li>
          </ul>
        </Section>

        <Section title="6. Transferencias internacionales">
          <p>
            Algunos de nuestros proveedores (Supabase, Cloudflare, Resend) procesan datos fuera de
            la República Dominicana. En todos los casos exigimos garantías contractuales equivalentes
            al nivel de protección establecido por la legislación dominicana.
          </p>
        </Section>

        <Section title="7. Conservación de datos">
          <p>
            Conservamos tus datos personales mientras tu cuenta esté activa o sea necesario para
            cumplir las finalidades descritas. Los datos de transacciones se conservan por un período
            mínimo de 5 años conforme a la legislación tributaria dominicana.
          </p>
        </Section>

        <Section title="8. Tus derechos">
          <p>
            Conforme a la Ley No. 172-13 y legislación aplicable, tienes derecho a:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              <strong className="text-foreground">Acceso:</strong> conocer qué datos tuyos
              procesamos.
            </li>
            <li>
              <strong className="text-foreground">Rectificación:</strong> corregir datos inexactos.
            </li>
            <li>
              <strong className="text-foreground">Cancelación:</strong> solicitar la eliminación de
              tus datos cuando ya no sean necesarios.
            </li>
            <li>
              <strong className="text-foreground">Oposición:</strong> oponerte al tratamiento en
              determinadas circunstancias.
            </li>
          </ul>
          <p className="mt-3">
            Para ejercer estos derechos contáctanos en{" "}
            <a href="https://instagram.com/buxxep" className="text-primary hover:underline">
              @buxxep
            </a>
            .
          </p>
        </Section>

        <Section title="9. Seguridad">
          <p>
            Implementamos medidas técnicas y organizativas para proteger tus datos: cifrado en
            tránsito (TLS), almacenamiento seguro de contraseñas (hash), y acceso restringido a
            bases de datos mediante roles y políticas de seguridad a nivel de fila (RLS) de
            Supabase.
          </p>
        </Section>

        <Section title="10. Menores de edad">
          <p>
            El Servicio no está dirigido a menores de 18 años. No recopilamos conscientemente datos
            de menores. Si detectamos que hemos recopilado datos de un menor sin el consentimiento
            paterno, los eliminaremos de inmediato.
          </p>
        </Section>

        <Section title="11. Cambios en esta política">
          <p>
            Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos de
            cambios significativos por correo electrónico o mediante un aviso destacado en la
            plataforma.
          </p>
        </Section>

      </div>

      <LegalNav current="privacidad" />
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
