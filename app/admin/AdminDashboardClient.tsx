"use client";

import {
  ArrowRight,
  Bell,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Package,
  Plus,
  ShoppingCart,
  Tag,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  formatDOPFromCents,
  parseFormattedCurrencyToNumber,
} from "@/lib/format-currency";
import type { Pedido } from "@/types";
import { formatDate } from "@/lib/format-date";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseTotal(total: string): number {
  return parseFormattedCurrencyToNumber(total);
}

function ingresosCompletados(pedidos: Pedido[]): number {
  return pedidos
    .filter((p) => p.estado === "completado")
    .reduce((sum, p) => sum + parseTotal(p.total), 0);
}

function formatMoneda(value: number): string {
  return formatDOPFromCents(Math.round(value * 100));
}

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------

const ESTADO_LABEL: Record<Pedido["estado"], string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completado: "Completado",
};

function StatusPill({ estado }: { estado: Pedido["estado"] }) {
  const cls =
    estado === "completado"
      ? "bg-emerald-500/15 text-emerald-400"
      : estado === "en_proceso"
        ? "bg-primary/15 text-primary"
        : "bg-amber-500/15 text-amber-400";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {ESTADO_LABEL[estado]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// KPI card
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
  sub?: string;
}

function KpiCard({ label, value, icon, accent, sub }: KpiCardProps) {
  return (
    <div
      className={`rounded-[14px] border bg-card p-5 ${
        accent ? "border-primary/30" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <span
          className={`flex size-8 items-center justify-center rounded-[10px] ${
            accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {sub ? (
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mini bar chart (status distribution)
// ---------------------------------------------------------------------------

function StatusBar({
  pendientes,
  enProceso,
  completados,
  total,
}: {
  pendientes: number;
  enProceso: number;
  completados: number;
  total: number;
}) {
  if (total === 0) return null;
  const pct = (n: number) => Math.round((n / total) * 100);
  const bars = [
    { label: "Pendiente", pct: pct(pendientes), cls: "bg-amber-400" },
    { label: "En proceso", pct: pct(enProceso), cls: "bg-primary" },
    { label: "Completado", pct: pct(completados), cls: "bg-emerald-400" },
  ].filter((b) => b.pct > 0);

  return (
    <div className="space-y-3">
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {bars.map((b) => (
          <div
            key={b.label}
            className={`${b.cls} transition-all`}
            style={{ width: `${b.pct}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {[
          { label: "Pendiente", n: pendientes, cls: "bg-amber-400" },
          { label: "En proceso", n: enProceso, cls: "bg-primary" },
          { label: "Completado", n: completados, cls: "bg-emerald-400" },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`size-2 rounded-full ${b.cls}`} />
            {b.label}
            <span className="font-semibold text-foreground">{b.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick actions
// ---------------------------------------------------------------------------

const QUICK_ACTIONS = [
  { label: "Nuevo artículo", href: "/admin/catalogo?create=1", icon: <Plus className="size-4" /> },
  { label: "Pedidos", href: "/admin/pedidos", icon: <ShoppingCart className="size-4" /> },
  { label: "Flash sale", href: "/admin/flash-sales/nuevo", icon: <Zap className="size-4" /> },
  { label: "Notificación", href: "/admin/notificaciones/nuevo", icon: <Bell className="size-4" /> },
  { label: "Cupón", href: "/admin/cupones/nuevo", icon: <Tag className="size-4" /> },
  { label: "Banner", href: "/admin/banners/nuevo", icon: <ClipboardList className="size-4" /> },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface AdminDashboardClientProps {
  initialPedidos: Pedido[];
  initialLineas: unknown[];
}

export function AdminDashboardClient({ initialPedidos }: AdminDashboardClientProps) {
  const pedidos = initialPedidos;

  const metrics = useMemo(() => {
    const total = pedidos.length;
    const pendientes = pedidos.filter((p) => p.estado === "pendiente").length;
    const enProceso = pedidos.filter((p) => p.estado === "en_proceso").length;
    const completados = pedidos.filter((p) => p.estado === "completado").length;
    const ingresos = ingresosCompletados(pedidos);
    return { total, pendientes, enProceso, completados, ingresos };
  }, [pedidos]);

  const recentPedidos = pedidos.slice(0, 10);

  const today = formatDate(new Date().toISOString(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Panel de administración</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{todayCapitalized}</p>
        </div>
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <ShoppingCart className="size-4" aria-hidden />
          Ver pedidos
        </Link>
      </div>

      {/* ── Alert banner ── */}
      {metrics.pendientes > 0 && (
        <div className="flex flex-col gap-3 rounded-[14px] border border-amber-500/25 bg-amber-500/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 text-sm">
            <Clock className="size-4 shrink-0 text-amber-400" aria-hidden />
            <span className="text-foreground">
              Tienes{" "}
              <span className="font-semibold text-amber-400">
                {metrics.pendientes} pedido{metrics.pendientes !== 1 ? "s" : ""} pendiente
                {metrics.pendientes !== 1 ? "s" : ""}
              </span>{" "}
              esperando revisión.
            </span>
          </div>
          <Link
            href="/admin/pedidos"
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-amber-400 hover:text-amber-300"
          >
            Revisar <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* ── KPI grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Ingresos confirmados"
          value={formatMoneda(metrics.ingresos)}
          icon={<CircleDollarSign className="size-4" />}
          accent
          sub={`${metrics.completados} pedido${metrics.completados !== 1 ? "s" : ""} completado${metrics.completados !== 1 ? "s" : ""}`}
        />
        <KpiCard
          label="Total pedidos"
          value={metrics.total}
          icon={<Package className="size-4" />}
          sub="este mes"
        />
        <KpiCard
          label="Pendientes"
          value={metrics.pendientes}
          icon={<Clock className="size-4" />}
          sub="requieren atención"
        />
        <KpiCard
          label="En proceso"
          value={metrics.enProceso}
          icon={<TrendingUp className="size-4" />}
          sub="en preparación"
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">

        {/* Left: recent orders */}
        <div className="space-y-6 lg:col-span-2">

          {/* Status breakdown */}
          <div className="rounded-[14px] border border-border bg-card p-5">
            <p className="mb-4 text-[13px] font-medium text-muted-foreground">
              Distribución de pedidos
            </p>
            <StatusBar
              pendientes={metrics.pendientes}
              enProceso={metrics.enProceso}
              completados={metrics.completados}
              total={metrics.total}
            />
          </div>

          {/* Recent orders table */}
          <div className="rounded-[14px] border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-[13px] font-semibold text-foreground">Pedidos recientes</p>
              <Link
                href="/admin/pedidos"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80"
              >
                Ver todos <ArrowRight className="size-3" />
              </Link>
            </div>
            {recentPedidos.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                No hay pedidos todavía.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-140 border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="px-5 py-3 text-left text-[12px] font-medium text-muted-foreground">
                        Pedido
                      </th>
                      <th className="px-5 py-3 text-left text-[12px] font-medium text-muted-foreground">
                        Cliente
                      </th>
                      <th className="px-5 py-3 text-left text-[12px] font-medium text-muted-foreground">
                        Total
                      </th>
                      <th className="px-5 py-3 text-left text-[12px] font-medium text-muted-foreground">
                        Fecha
                      </th>
                      <th className="px-5 py-3 text-left text-[12px] font-medium text-muted-foreground">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPedidos.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                          #{p.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-5 py-3 font-medium text-foreground">
                          {p.cliente}
                        </td>
                        <td className="px-5 py-3 tabular-nums text-foreground">
                          {p.total}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {p.createdAt ?? "—"}
                        </td>
                        <td className="px-5 py-3">
                          <StatusPill estado={p.estado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: quick actions */}
        <div className="space-y-6">
          <div className="rounded-[14px] border border-border bg-card p-5">
            <p className="mb-4 text-[13px] font-semibold text-foreground">Acciones rápidas</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex flex-col items-center gap-2 rounded-[10px] border border-border bg-[#0c0c0e] p-3.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                >
                  <span className="flex size-8 items-center justify-center rounded-[10px] bg-muted text-foreground">
                    {a.icon}
                  </span>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Links sección */}
          <div className="rounded-[14px] border border-border bg-card p-5">
            <p className="mb-3 text-[13px] font-semibold text-foreground">Módulos</p>
            <nav className="space-y-1">
              {[
                { label: "Catálogo", href: "/admin/catalogo", desc: `${metrics.total} productos` },
                { label: "Categorías", href: "/admin/categorias", desc: "Organización" },
                { label: "Flash sales", href: "/admin/flash-sales", desc: "Promociones activas" },
                { label: "Cupones", href: "/admin/cupones", desc: "Descuentos" },
                { label: "Banners", href: "/admin/banners", desc: "Inicio tienda" },
                { label: "Almacenes", href: "/admin/almacenes", desc: "Inventario" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-[10px] px-3 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <div>
                    <p className="text-[13px] font-medium text-foreground group-hover:text-primary">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
