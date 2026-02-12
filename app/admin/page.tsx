import { PageLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_PEDIDOS } from "@/config/mock-data";
import type { Pedido } from "@/types";

function kpis(pedidos: Pedido[]) {
  return {
    total: pedidos.length,
    pendientes: pedidos.filter((p) => p.estado === "pendiente").length,
    enProceso: pedidos.filter((p) => p.estado === "en_proceso").length,
    completados: pedidos.filter((p) => p.estado === "completado").length,
  };
}

/** Parsea total (string) a número. Acepta "€45.00", "45,00 €", "99.00", etc. */
function parseTotal(total: string): number {
  if (!total || typeof total !== "string") return 0;
  const normalized = total.replace(/\s/g, "").replace(/[€$£,]/g, (m) => (m === "," ? "." : ""));
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

/** Ingresos = suma de total de pedidos completados (ingresos realizados). */
function ingresosCompletados(pedidos: Pedido[]): number {
  return pedidos
    .filter((p) => p.estado === "completado")
    .reduce((sum, p) => sum + parseTotal(p.total), 0);
}

function formatMoneda(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const KPI_LABELS = [
  { key: "total" as const, label: "Total pedidos" },
  { key: "pendientes" as const, label: "Pendientes" },
  { key: "enProceso" as const, label: "En proceso" },
  { key: "completados" as const, label: "Completados" },
] as const;

export default function AdminPage() {
  const metrics = kpis(MOCK_PEDIDOS);
  const ingresos = ingresosCompletados(MOCK_PEDIDOS);

  return (
    <PageLayout title="Panel de administración">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_LABELS.map(({ key, label }) => (
          <Card key={key} className="border-border">
            <CardContent className="p-6">
              <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {metrics[key]}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section aria-label="Resumen financiero" className="space-y-2">
        <h2 className="text-lg font-medium text-foreground">Resumen financiero</h2>
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              {formatMoneda(ingresos)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ingresos totales (pedidos completados)
            </p>
          </CardContent>
        </Card>
      </section>
    </PageLayout>
  );
}
