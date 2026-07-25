import type { Metadata } from "next";
import Link from "next/link";
import { SecurityBadges } from "@/components/ui/security-badges";

export const metadata: Metadata = {
  title: "Seguridad de Datos — Buxxep",
  description:
    "Conoce cómo Buxxep protege tus datos de pago mediante cifrado SSL, 3D Secure y procesadores PCI-DSS.",
};

const LAST_UPDATED = "16 de mayo de 2026";

export default function SeguridadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Seguridad de Datos
        </h1>
        <p className="text-sm text-muted-foreground">Última actualización: {LAST_UPDATED}</p>
      </div>

      {/* Highlight box */}
      <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm text-foreground">
          <strong>Resumen:</strong> Buxxep nunca almacena datos de tu tarjeta en nuestros servidores.
          Toda transacción es procesada directamente por{" "}
          <strong>Azul</strong>, procesador certificado PCI-DSS, con cifrado{" "}
          <strong>TLS 1.2/1.3</strong> y autenticación <strong>3D Secure</strong>.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">

        <Section title="1. Cifrado en tránsito (SSL/TLS)">
          <p>
            Toda la comunicación entre tu navegador y nuestros servidores se realiza mediante{" "}
            <strong className="text-foreground">HTTPS con cifrado TLS 1.2 o superior</strong>. Esto
            garantiza que la información que intercambias — incluyendo datos personales, diseños y
            detalles de pago — viaje encriptada y no pueda ser interceptada por terceros.
          </p>
          <p className="mt-2">
            Puedes verificar la conexión segura por el candado (🔒) que aparece en la barra de
            dirección de tu navegador al visitar buxxep.com.
          </p>
        </Section>

        <Section title="2. Procesamiento de pagos — Azul">
          <p>
            Los pagos con tarjeta son procesados exclusivamente por{" "}
            <strong className="text-foreground">Azul</strong> (Procesadora de Tarjetas del Caribe,
            S.A.), el principal adquirente certificado{" "}
            <strong className="text-foreground">PCI-DSS</strong> de la República Dominicana.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Buxxep no almacena</strong> número de tarjeta, CVV
              ni fecha de expiración en ningún momento.
            </li>
            <li>
              Los datos de tu tarjeta se transmiten directamente a los servidores seguros de Azul,
              nunca pasan por nuestros sistemas.
            </li>
            <li>
              Azul cumple con el estándar{" "}
              <strong className="text-foreground">PCI-DSS (Payment Card Industry Data Security
              Standard)</strong>, el nivel más alto de seguridad para el manejo de datos de pago.
            </li>
          </ul>
        </Section>

        <Section title="3. Autenticación 3D Secure">
          <p>
            Todas las transacciones en Buxxep están protegidas con{" "}
            <strong className="text-foreground">3D Secure</strong> (también conocido como Verified
            by Visa o Mastercard Identity Check). Este protocolo agrega una capa adicional de
            autenticación al proceso de pago:
          </p>
          <ol className="mt-3 list-inside list-decimal space-y-2 pl-2">
            <li>Al pagar, serás redirigido a la página segura de tu banco emisor.</li>
            <li>
              Tu banco verificará tu identidad mediante un código OTP enviado a tu teléfono
              registrado, una clave dinámica o datos biométricos (según el banco).
            </li>
            <li>Solo tras la aprobación del banco se completará el cargo.</li>
          </ol>
          <p className="mt-3">
            3D Secure protege al tarjetahabiente contra el uso no autorizado de su tarjeta en
            compras en línea. Si una transacción es rechazada por este proceso, significa que no
            pudo verificarse la identidad del portador.
          </p>
          <div className="mt-4">
            <SecurityBadges />
          </div>
        </Section>

        <Section title="4. Tarjetas aceptadas">
          <p>Aceptamos las siguientes tarjetas de crédito y débito:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>Visa</li>
            <li>Mastercard</li>
            <li>Maestro</li>
            <li>American Express</li>
            <li>Discover</li>
            <li>Diners Club</li>
            <li>JCB</li>
            <li>Apple Pay</li>
            <li>Google Pay</li>
          </ul>
        </Section>

        <Section title="5. Seguridad de tu cuenta">
          <p>
            Para proteger tu cuenta en Buxxep implementamos las siguientes medidas:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Contraseñas hasheadas:</strong> tu contraseña
              nunca se almacena en texto plano; usamos algoritmos de hash seguros (bcrypt) a través
              de Supabase Auth.
            </li>
            <li>
              <strong className="text-foreground">Verificación por correo:</strong> al registrarte,
              se requiere confirmar tu dirección de email mediante un enlace o código OTP.
            </li>
            <li>
              <strong className="text-foreground">Sesiones seguras:</strong> usamos tokens JWT con
              expiración y cookies HttpOnly para manejar sesiones.
            </li>
            <li>
              <strong className="text-foreground">Row-Level Security (RLS):</strong> cada usuario
              solo puede acceder a sus propios datos gracias a las políticas de seguridad a nivel de
              fila en nuestra base de datos (Supabase/PostgreSQL).
            </li>
          </ul>
        </Section>

        <Section title="6. Responsabilidad del tarjetahabiente">
          <p>Para mantener la seguridad de tus transacciones, te recomendamos:</p>
          <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
            <li>No compartir tus credenciales de cuenta con terceros.</li>
            <li>No realizar compras desde redes Wi-Fi públicas no seguras.</li>
            <li>
              Verificar siempre que la URL comience con{" "}
              <strong className="text-foreground">https://</strong> antes de ingresar datos de pago.
            </li>
            <li>
              Contactar inmediatamente a tu banco si detectas cargos no autorizados.
            </li>
            <li>Mantener actualizada la información de contacto en tu banco para recibir OTP.</li>
          </ul>
        </Section>

        <Section title="7. Notificación de incidentes">
          <p>
            En el improbable caso de que Buxxep detecte una brecha de seguridad que afecte datos
            de usuarios, notificaremos a los afectados en un plazo máximo de{" "}
            <strong className="text-foreground">72 horas</strong> desde que tengamos conocimiento
            del incidente, conforme a la legislación aplicable.
          </p>
        </Section>

        <Section title="8. Contacto de seguridad">
          <p>
            Si detectas una vulnerabilidad o tienes dudas sobre la seguridad de tus datos,
            contáctanos:
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 pl-2">
            <li>
              Correo:{" "}
              <a href="mailto:soporte@buxxep.com" className="text-primary hover:underline">
                soporte@buxxep.com
              </a>
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
        </Section>

      </div>

      <LegalNav current="seguridad" />
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
