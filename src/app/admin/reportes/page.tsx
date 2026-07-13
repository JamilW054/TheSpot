import {
  AdminPageHeader,
  BarsChart,
  ChartCard,
  DonutChart,
  RankedBarList,
  RevenueAreaChart,
  StatCard,
} from "@/components/admin/ui";
import { getAdminDashboardMetrics } from "@/database/repositories/admin-metrics";
import { formatDOPFromCents } from "@/lib/format-currency";

export const dynamic = "force-dynamic";

export default async function AdminReportesPage() {
  const metrics = await getAdminDashboardMetrics();

  const paymentSlices = [
    {
      name: "Pagado",
      value: metrics.paymentStatus.paid,
      color: "var(--admin-success)",
    },
    {
      name: "Pendiente",
      value: metrics.paymentStatus.pending,
      color: "var(--admin-warning)",
    },
    {
      name: "Rechazado",
      value: metrics.paymentStatus.declined,
      color: "var(--admin-danger)",
    },
  ].filter((s) => s.value > 0);

  const fulfillmentSlices = [
    {
      name: "Pendiente",
      value: metrics.orderStatus.pendiente,
      color: "var(--admin-warning)",
    },
    {
      name: "En proceso",
      value: metrics.orderStatus.enProceso,
      color: "var(--admin-brand)",
    },
    {
      name: "Completado",
      value: metrics.orderStatus.completado,
      color: "var(--admin-success)",
    },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reportes"
        description="Análisis de ventas, ingresos, pagos e inventario."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Reportes" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ingresos · 30 días"
          value={formatDOPFromCents(metrics.revenue30dCents)}
          deltaPct={metrics.revenue30dDeltaPct}
          sub="vs. 30 días previos"
          accent
        />
        <StatCard
          label="Pedidos · 180 días"
          value={metrics.totalOrders}
          sub={`${metrics.paymentStatus.paid} pagados`}
        />
        <StatCard
          label="Ticket medio"
          value={
            metrics.paidOrders30d > 0
              ? formatDOPFromCents(
                  Math.round(metrics.revenue30dCents / metrics.paidOrders30d),
                )
              : "—"
          }
          sub="pedidos pagados · 30 días"
        />
        <StatCard
          label="Clientes"
          value={metrics.registeredCustomers.toLocaleString("es-DO")}
          sub="registrados"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Ingresos en el tiempo"
          description="Pedidos pagados · últimos 30 días"
          className="lg:col-span-2"
        >
          <RevenueAreaChart data={metrics.revenueSeries} format="dop-compact" />
        </ChartCard>
        <ChartCard title="Estado de pagos" description="Últimos 180 días">
          <DonutChart
            data={paymentSlices}
            centerValue={String(metrics.totalOrders)}
            centerLabel="pedidos"
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Tendencia de pedidos" description="Últimos 30 días">
          <BarsChart data={metrics.ordersSeries} height={220} />
        </ChartCard>
        <ChartCard
          title="Comparativa mensual"
          description="Ingresos pagados · 6 meses"
        >
          <BarsChart
            data={metrics.monthlySeries}
            height={220}
            seriesName="Ingresos"
            format="dop-compact"
            color="#8b5cf6"
          />
        </ChartCard>
        <ChartCard
          title="Gestión de pedidos"
          description="Estado · últimos 180 días"
        >
          <DonutChart data={fulfillmentSlices} height={180} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Top productos"
          description="Por unidades vendidas · 180 días"
        >
          <RankedBarList
            data={metrics.topProducts.map((p) => ({
              name: p.name,
              value: p.units,
              sub: formatDOPFromCents(p.revenueCents),
            }))}
          />
        </ChartCard>
        <ChartCard
          title="Inventario por categoría"
          description="Productos activos"
        >
          <DonutChart
            data={metrics.categoryDistribution}
            centerValue={String(metrics.catalog.active)}
            centerLabel="activos"
          />
        </ChartCard>
      </div>
    </div>
  );
}
