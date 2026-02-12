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

const KPI_LABELS = [
  { key: "total" as const, label: "Total pedidos" },
  { key: "pendientes" as const, label: "Pendientes" },
  { key: "enProceso" as const, label: "En proceso" },
  { key: "completados" as const, label: "Completados" },
] as const;

export default function AdminPage() {
  const metrics = kpis(MOCK_PEDIDOS);

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
    </PageLayout>
  );
}
