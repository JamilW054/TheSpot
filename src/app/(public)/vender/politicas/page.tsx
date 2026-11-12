import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Políticas para vendedores",
  description:
    "Reglas para vender en The Spot: productos permitidos, prohibidos y responsabilidades de cada tienda.",
};

const LAST_UPDATED = "11 de noviembre de 2026";

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

export default function PoliticasVendedoresPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
          Vende en The Spot
        </p>
        <h1 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
          Políticas para vendedores
        </h1>
        <p className="text-sm text-muted-foreground">
          Última actualización: {LAST_UPDATED}
        </p>
      </div>

      <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
        <strong>Resumen:</strong> cada tienda pasa por revisión antes de vender.
        Si una tienda publica contenido prohibido, se retiran los productos y la
        tienda puede ser suspendida sin previo aviso.
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <Section title="1. Aprobación de tiendas">
          <p>
            Toda tienda se registra con datos reales del negocio o de la persona
            responsable. The Spot puede pedir información adicional, y aprobar,
            rechazar o suspender cualquier tienda que no cumpla estas políticas.
          </p>
        </Section>

        <Section title="2. Productos y contenido prohibidos">
          <ul className="list-inside list-disc space-y-1 pl-2">
            <li>
              Contenido sexual, pornográfico, erótico o juguetes y artículos
              para adultos.
            </li>
            <li>
              Armas de fuego, municiones, armas blancas de ataque y explosivos.
            </li>
            <li>
              Drogas, sustancias controladas, productos con THC y parafernalia.
            </li>
            <li>
              Medicamentos con receta, suplementos sin registro sanitario.
            </li>
            <li>
              Réplicas, imitaciones, falsificaciones o productos que violen
              marcas registradas.
            </li>
            <li>
              Animales vivos, productos robados o cualquier artículo ilegal en
              República Dominicana.
            </li>
            <li>Imágenes ofensivas, discriminatorias o engañosas.</li>
          </ul>
        </Section>

        <Section title="3. Publicaciones">
          <p>
            Las fotos y descripciones deben corresponder al producto real.
            Precio, tallas, colores e inventario deben mantenerse al día.
            Algunas publicaciones pasan por revisión antes de mostrarse.
          </p>
        </Section>

        <Section title="4. Pedidos, cobros y entregas">
          <p>
            Cada tienda recibe y gestiona sus propios pedidos, cobra
            directamente al cliente (contra entrega o transferencia a sus
            cuentas) y es responsable del envío, las devoluciones y la atención
            al cliente. The Spot no procesa pagos de las tiendas.
          </p>
        </Section>

        <Section title="5. Denuncias">
          <p>
            Los clientes pueden reportar productos. Las denuncias se revisan y
            pueden terminar en el retiro del producto o la suspensión de la
            tienda.
          </p>
        </Section>

        <Section title="6. Datos personales">
          <p>
            Los datos de los clientes se usan solo para entregar sus pedidos.
            Está prohibido usarlos para otros fines o compartirlos con terceros.
            Ver{" "}
            <Link href="/privacidad" className="text-primary hover:underline">
              política de privacidad
            </Link>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}
