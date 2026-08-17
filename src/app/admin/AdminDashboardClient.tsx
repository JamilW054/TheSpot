"use client";

import {
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  Clock,
  PackageX,
  Plus,
  Settings,
  ShoppingCart,
  Tag,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  AdminBadge,
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
  BarsChart,
  ChartCard,
  DataTable,
  type DataTableColumn,
  DonutChart,
  EmptyState,
  RankedBarList,
  RevenueAreaChart,
  StatCard,
} from "@/components/admin/ui";
import type { AdminDashboardMetrics } from "@/database/repositories/admin-metrics";
import { formatDOPFromCents } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import {
  ORDER_STATUS_PARAM,
  type OrderStatusFilter,
} from "@/lib/orders/status";
import type { Pedido } from "@/types";

/** Estado con el que se abre /admin/pedidos para los pedidos sin cobrar. */
const UNPAID_STATUS: OrderStatusFilter = "pending";
const UNPAID_ORDERS_HREF = `/admin/pedidos?${ORDER_STATUS_PARAM}=${UNPAID_STATUS}`;

const ESTADO_BADGE: Record<
  Pedido["estado"],
  { label: string; tone: "success" | "warning" | "brand" }
> = {
  pendiente: { label: "Pendiente", tone: "warning" },
  en_proceso: { label: "En proceso", tone: "brand" },
  completado: { label: "Completado", tone: "success" },
};

const PAGO_BADGE: Record<
  Pedido["paymentStatus"],
  { label: string; tone: "success" | "warning" | "danger" }
> = {
  paid: { label: "Pagado", tone: "success" },
  pending: { label: "Pendiente", tone: "warning" },
  declined: { label: "Rechazado", tone: "danger" },
};

const QUICK_ACTIONS = [
  { label: "Nuevo producto", href: "/admin/catalogo?create=1", icon: Plus },
  { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
  { label: "Cupón", href: "/admin/cupones/nuevo", icon: Tag },
  { label: "Configuración", href: "/admin/config", icon: Settings },
] as const;

const PEDIDO_COLUMNS: DataTableColumn<Pedido>[] = [
  {
    key: "id",
    header: "Pedido",
    cell: (p) => (
      <span className="font-mono text-xs text-muted-foreground">
        #{p.id.slice(0, 8).toUpperCase()}
      </span>
    ),
  },
  {
    key: "cliente",
    header: "Cliente",
    sortValue: (p) => p.cliente,
    cell: (p) => (
      <span className="font-medium text-foreground">{p.cliente}</span>
    ),
    className: "max-w-[220px] truncate",
  },
  {
    key: "total",
    header: "Total",
    align: "right",
    sortValue: (p) => p.totalCents,
    cell: (p) => (
      <span className="tabular-nums text-foreground">{p.total}</span>
    ),
  },
  {
    key: "fecha",
    header: "Fecha",
    cell: (p) => (
      <span className="text-xs text-muted-foreground">
        {p.createdAt ?? "—"}
      </span>
    ),
    className: "hidden sm:table-cell",
    headerClassName: "hidden sm:table-cell",
  },
  {
    key: "pago",
    header: "Pago",
    cell: (p) => {
      const b = PAGO_BADGE[p.paymentStatus];
      return <AdminBadge tone={b.tone}>{b.label}</AdminBadge>;
    },
    className: "hidden md:table-cell",
    headerClassName: "hidden md:table-cell",
  },
  {
    key: "estado",
    header: "Estado",
    cell: (p) => {
      const b = ESTADO_BADGE[p.estado];
      return (
        <AdminBadge tone={b.tone} dot>
          {b.label}
        </AdminBadge>
      );
    },
  },
];

export interface AdminDashboardClientProps {
  metrics: AdminDashboardMetrics;
  /** Pedidos recientes ya **pagados** (los únicos que lista el resumen). */
  recentPedidos: Pedido[];
  /** Total de pedidos sin cobrar; enlazan a /admin/pedidos con ese filtro. */
  unpaidOrdersCount: number;
}

export function AdminDashboardClient({
  metrics,
  recentPedidos,
  unpaidOrdersCount,
}: AdminDashboardClientProps) {
  const today = formatDate(new Date().toISOString(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

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

  return (
    <div className="space-y-6">
      {/* ── Cabecera ── */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {todayCapitalized}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/catalogo?create=1"
            className="inline-flex h-9 items-center gap-2 rounded-[18px] border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="size-4" aria-hidden />
            Nuevo artículo
          </Link>
          <Link
            href="/admin/pedidos"
            className="inline-flex h-9 items-center gap-2 rounded-[18px] bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ShoppingCart className="size-4" aria-hidden />
            Ver pedidos
          </Link>
        </div>
      </header>

      {/* ── Aviso de pendientes ── */}
      {metrics.pendingOrders > 0 && (
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-(--admin-warning-soft) px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 text-sm text-foreground">
            <Clock
              className="size-4 shrink-0 text-(--admin-warning)"
              aria-hidden
            />
            <span>
              Tienes{" "}
              <span className="font-semibold text-(--admin-warning)">
                {metrics.pendingOrders} pedido
                {metrics.pendingOrders !== 1 ? "s" : ""} pendiente
                {metrics.pendingOrders !== 1 ? "s" : ""}
              </span>{" "}
              esperando revisión.
            </span>
          </div>
          <Link
            href={UNPAID_ORDERS_HREF}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-(--admin-warning) hover:opacity-80"
          >
            Revisar <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      )}

      {/* ── KPIs: ventas ── */}
      <section
        aria-label="Métricas de ventas"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Ventas de hoy"
          value={formatDOPFromCents(metrics.todayRevenueCents)}
          sub={`${metrics.todayOrders} pedido${metrics.todayOrders !== 1 ? "s" : ""} hoy`}
          deltaPct={metrics.todayRevenueDeltaPct}
          icon={<CircleDollarSign className="size-4" />}
          accent
        />
        <StatCard
          label="Ingresos · 30 días"
          value={formatDOPFromCents(metrics.revenue30dCents)}
          deltaPct={metrics.revenue30dDeltaPct}
          sub="vs. 30 días previos"
          icon={<TrendingUp className="size-4" />}
        />
        <StatCard
          label="Pedidos pendientes"
          value={metrics.pendingOrders}
          sub="requieren atención"
          icon={<Clock className="size-4" />}
        />
      </section>

      {/* ── KPIs: catálogo y clientes ── */}
      <section
        aria-label="Métricas de catálogo y clientes"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          label="Sin stock"
          value={metrics.outOfStockCount}
          sub={`de ${metrics.catalog.active} productos activos`}
          icon={<PackageX className="size-4" />}
        />
        <StatCard
          label="Inventario bajo"
          value={metrics.lowStockCount}
          sub="5 unidades o menos"
          icon={<AlertTriangle className="size-4" />}
        />
        <StatCard
          label="Clientes registrados"
          value={metrics.registeredCustomers.toLocaleString("es-DO")}
          sub="cuentas activas"
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Más vendido"
          value={metrics.bestSeller ? metrics.bestSeller.name : "—"}
          valueSize="sm"
          sub={
            metrics.bestSeller
              ? `${metrics.bestSeller.units} uds · ${formatDOPFromCents(metrics.bestSeller.revenueCents)}`
              : "sin ventas aún"
          }
          icon={<Trophy className="size-4" />}
          accent
        />
      </section>

      {/* ── Ingresos + estado de pagos ── */}
      <section
        aria-label="Analítica de ingresos"
        className="grid gap-4 lg:grid-cols-3"
      >
        <ChartCard
          title="Ingresos"
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
      </section>

      {/* ── Pedidos + comparativa mensual + categorías ── */}
      <section aria-label="Tendencias" className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Pedidos" description="Últimos 30 días">
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
          title="Catálogo por categoría"
          description="Productos activos"
        >
          <DonutChart
            data={metrics.categoryDistribution}
            centerValue={String(metrics.catalog.active)}
            centerLabel="activos"
            height={180}
          />
        </ChartCard>
      </section>

      {/* ── Top productos + inventario bajo + acciones ── */}
      <section
        aria-label="Productos e inventario"
        className="grid gap-4 lg:grid-cols-3"
      >
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

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>Inventario bajo</AdminCardTitle>
            <Link
              href="/admin/catalogo"
              className="flex items-center gap-1 text-xs font-medium text-(--admin-brand-strong) hover:opacity-80"
            >
              Ver catálogo <ArrowRight className="size-3" aria-hidden />
            </Link>
          </AdminCardHeader>
          {metrics.lowStockProducts.length === 0 &&
          metrics.outOfStockCount === 0 ? (
            <EmptyState
              icon={<PackageX className="size-5" />}
              title="Inventario saludable"
              description="Ningún producto activo por debajo del umbral."
            />
          ) : (
            <AdminCardContent className="space-y-1 p-3">
              {metrics.lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-[10px] px-2.5 py-2 transition-colors hover:bg-muted/60"
                >
                  <span className="min-w-0 truncate text-sm font-medium text-foreground">
                    {p.name}
                  </span>
                  <AdminBadge tone={p.available <= 2 ? "danger" : "warning"}>
                    {p.available} uds
                  </AdminBadge>
                </div>
              ))}
              {metrics.outOfStockCount > 0 && (
                <p className="px-2.5 pt-2 text-xs text-muted-foreground">
                  {metrics.outOfStockCount} producto
                  {metrics.outOfStockCount !== 1 ? "s" : ""} sin stock
                  disponible.
                </p>
              )}
            </AdminCardContent>
          )}
        </AdminCard>

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>Acciones rápidas</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent className="grid grid-cols-2 gap-2 p-3">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex flex-col items-center gap-2 rounded-[18px] border border-border bg-card p-3.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-(--admin-brand) hover:bg-(--admin-brand-soft) hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-8 items-center justify-center rounded-[10px] bg-muted text-foreground">
                  <a.icon className="size-4" aria-hidden />
                </span>
                {a.label}
              </Link>
            ))}
          </AdminCardContent>
        </AdminCard>
      </section>

      {/* ── Pedidos recientes (solo pagados) ── */}
      <section aria-label="Pedidos pagados recientes" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Pedidos recientes
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Solo pedidos pagados
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {unpaidOrdersCount > 0 && (
              <Link
                href={UNPAID_ORDERS_HREF}
                className="flex items-center gap-1 text-xs font-medium text-(--admin-warning) hover:opacity-80"
              >
                {unpaidOrdersCount} sin pagar
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            )}
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-1 text-xs font-medium text-(--admin-brand-strong) hover:opacity-80"
            >
              Ver pagados <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>
        </div>
        <DataTable
          rows={recentPedidos}
          columns={PEDIDO_COLUMNS}
          rowKey={(p) => p.id}
          ariaLabel="Pedidos pagados recientes"
          emptyState={
            <EmptyState
              icon={<ShoppingCart className="size-5" />}
              title="No hay pedidos pagados todavía"
              description={
                unpaidOrdersCount > 0
                  ? `Hay ${unpaidOrdersCount} pedido${unpaidOrdersCount !== 1 ? "s" : ""} sin cobrar esperando pago.`
                  : "Los pedidos aparecerán aquí en cuanto se confirme el cobro."
              }
              action={
                unpaidOrdersCount > 0 ? (
                  <Link
                    href={UNPAID_ORDERS_HREF}
                    className="inline-flex items-center gap-2 rounded-[18px] border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    Ver pedidos sin pagar
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                ) : undefined
              }
            />
          }
        />
      </section>
    </div>
  );
}
