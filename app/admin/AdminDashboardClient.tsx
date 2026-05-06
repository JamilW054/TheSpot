"use client";

import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PedidosTable } from "@/features/admin";
import {
  formatDOPFromCents,
  parseFormattedCurrencyToNumber,
} from "@/lib/format-currency";
import type { Linea, Pedido } from "@/types";

function kpis(pedidos: Pedido[]) {
  return {
    total: pedidos.length,
    pendientes: pedidos.filter((p) => p.estado === "pendiente").length,
    enProceso: pedidos.filter((p) => p.estado === "en_proceso").length,
    completados: pedidos.filter((p) => p.estado === "completado").length,
  };
}

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

function MiniChart({ up }: { up: boolean }) {
  const points = up
    ? "0,12 4,10 8,8 12,6 16,4 20,8 24,4"
    : "0,6 4,8 8,10 12,8 16,10 20,6 24,10";
  return (
    <svg
      viewBox="0 0 24 16"
      className="h-8 w-full shrink-0 opacity-80"
      aria-hidden
    >
      <title>Mini gráfico</title>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function ComingUpCalendar() {
  const [month, setMonth] = useState(new Date());
  const year = month.getFullYear();
  const monthName = month.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  const firstDay = new Date(year, month.getMonth(), 1);
  const lastDay = new Date(year, month.getMonth() + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days = Array.from({ length: lastDay.getDate() }, (_, i) => i + 1);
  const today = new Date();
  const isToday = (d: number) =>
    today.getDate() === d &&
    today.getMonth() === month.getMonth() &&
    today.getFullYear() === year;

  return (
    <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100">Próximamente</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonth(new Date(year, month.getMonth() - 1))}
            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setMonth(new Date(year, month.getMonth() + 1))}
            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <p className="mb-3 text-xs capitalize text-zinc-400">{monthName}</p>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-zinc-500">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
          <span key={d}>{d}</span>
        ))}
        {Array.from({ length: startPad }, (_, i) => (
          // Índice estable dentro del mes: huecos antes del día 1
          <span key={`cal-empty-${year}-${month.getMonth()}-${i}`} />
        ))}
        {days.map((d) => (
          <button
            key={d}
            type="button"
            className={`rounded p-1 tabular-nums ${
              isToday(d)
                ? "bg-primary text-primary-foreground"
                : "text-zinc-300 hover:bg-zinc-700/50"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

const ESTADO_LABEL: Record<Pedido["estado"], string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completado: "Completado",
};

export interface AdminDashboardClientProps {
  initialPedidos: Pedido[];
  initialLineas: Linea[];
}

export function AdminDashboardClient({
  initialPedidos,
  initialLineas,
}: AdminDashboardClientProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos);
  const metrics = kpis(pedidos);
  const ingresos = ingresosCompletados(pedidos);
  const pendientes = metrics.pendientes;

  const handleMarkEnProceso = (ids: string[]) => {
    setPedidos((prev) =>
      prev.map((p) =>
        ids.includes(p.id) ? { ...p, estado: "en_proceso" as const } : p,
      ),
    );
  };

  const handleMarkCompletado = (ids: string[]) => {
    setPedidos((prev) =>
      prev.map((p) =>
        ids.includes(p.id) ? { ...p, estado: "completado" as const } : p,
      ),
    );
  };

  const recentPedidos = pedidos.slice(0, 8);
  const lineasSlice = initialLineas.slice(0, 5);

  return (
    <div className="min-h-full space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <p className="min-w-0 text-sm text-zinc-200">
          {pendientes > 0 ? (
            <>
              <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                {pendientes} pendientes
              </span>
              {" — "}
              Tienes {pendientes} pedido{pendientes !== 1 ? "s" : ""} pendiente
              {pendientes !== 1 ? "s" : ""} de revisar.
            </>
          ) : (
            "Todo al día. No hay pedidos pendientes."
          )}
        </p>
        <Link
          href="/admin/pedidos"
          className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto sm:justify-end"
        >
          Ver pedidos
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
        <div className="space-y-4 lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900/95 shadow-xl ring-1 ring-primary/10">
            <div className="absolute right-4 top-4 text-[120px] font-bold leading-none text-primary/10">
              B
            </div>
            <div className="relative p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <span>Ingresos (completados)</span>
                    <button
                      type="button"
                      className="rounded p-0.5 hover:bg-zinc-600/50"
                      aria-label="Más información"
                    >
                      <Info className="size-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-white">
                    {formatMoneda(ingresos)}
                  </p>
                  <p className="mt-1 text-sm text-emerald-400">
                    {metrics.completados} pedidos completados este mes
                  </p>
                </div>
              </div>
              <div className="mt-4 h-12 text-primary/45">
                <MiniChart up={true} />
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                <Calendar className="size-3.5" />
                Resumen del mes en curso
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                key: "pendientes" as const,
                label: "Pendientes",
                value: metrics.pendientes,
                change: "+40% vs mes anterior",
                up: true,
                color: "text-emerald-400",
              },
              {
                key: "enProceso" as const,
                label: "En proceso",
                value: metrics.enProceso,
                change: "−10% vs mes anterior",
                up: false,
                color: "text-red-400",
              },
              {
                key: "completados" as const,
                label: "Completados",
                value: metrics.completados,
                change: "+20% vs mes anterior",
                up: true,
                color: "text-emerald-400",
              },
            ].map(({ key, label, value, change, up, color }) => (
              <div
                key={key}
                className="rounded-2xl border border-zinc-700/80 bg-zinc-900/80 p-4 shadow-sm"
              >
                <p className="text-xs font-medium text-zinc-400">{label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                  {value}
                </p>
                <p className={`mt-1 text-xs ${color}`}>{change}</p>
                <div className="mt-2 h-8 w-full text-zinc-500">
                  <MiniChart up={up} />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-zinc-500">
            Tienes {pedidos.length} pedidos en total este mes.
          </p>

          <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/80 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-700/80 px-4 py-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                Pedidos recientes
              </h2>
              <Link
                href="/admin/pedidos"
                className="text-xs font-medium text-primary hover:text-primary/80"
              >
                Ver todos
              </Link>
            </div>
            <div className="scrollbar-hide overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-700/80 bg-zinc-800/50 text-zinc-400">
                    <th className="px-4 py-3 font-medium">Pedido ↓</th>
                    <th className="px-4 py-3 font-medium">Fecha ↓</th>
                    <th className="px-4 py-3 font-medium">Total ↓</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPedidos.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-zinc-700/50 transition-colors hover:bg-zinc-800/30"
                    >
                      <td className="px-4 py-3 font-mono text-zinc-200">
                        {p.id}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {p.createdAt ?? "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-zinc-200">
                        {p.total}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{p.cliente}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            p.estado === "completado"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : p.estado === "en_proceso"
                                ? "bg-primary/15 text-primary"
                                : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {ESTADO_LABEL[p.estado]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/80 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100">
                Líneas Buxxep
              </h3>
              <button
                type="button"
                className="rounded p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
                aria-label="Actualizar"
              >
                <RefreshCw className="size-4" />
              </button>
            </div>
            <div className="space-y-2">
              <details className="group" open>
                <summary className="flex cursor-pointer list-none items-center gap-2 py-1.5 text-xs font-medium text-zinc-300">
                  <ShoppingBag className="size-4 text-zinc-500" />
                  Líneas de producto
                  <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="mt-2 space-y-1.5 pl-6">
                  {lineasSlice.map((l) => (
                    <li
                      key={l.id}
                      className="flex items-center gap-2 text-xs text-zinc-400"
                    >
                      <span className="size-2 rounded-full bg-zinc-500" />
                      <Link
                        href={`/lineas/${l.slug}`}
                        className="hover:text-zinc-200"
                      >
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
              <div className="flex items-center gap-2 border-t border-zinc-700/80 pt-3">
                <Sparkles className="size-4 text-zinc-500" />
                <span className="text-xs text-zinc-500">Diseños y editor</span>
                <ChevronDown className="size-4 text-zinc-500" />
              </div>
            </div>
            <Link
              href="/lineas"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ver líneas
            </Link>
          </div>

          <ComingUpCalendar />
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-700/80 bg-zinc-900/80 p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-zinc-100">
          Todos los pedidos
        </h2>
        <PedidosTable
          pedidos={pedidos}
          withFilters
          onMarkEnProceso={handleMarkEnProceso}
          onMarkCompletado={handleMarkCompletado}
        />
      </section>
    </div>
  );
}
