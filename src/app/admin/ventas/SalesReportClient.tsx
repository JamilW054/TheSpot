"use client";

import {
  Banknote,
  ChevronDown,
  Download,
  FileText,
  Package,
  Percent,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useState, useTransition } from "react";
import {
  AdminBadge,
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
  AdminPageHeader,
  BarsChart,
  ChartCard,
  DonutChart,
  EmptyState,
  RevenueAreaChart,
  StatCard,
} from "@/components/admin/ui";
import type { SalesReport } from "@/database/repositories/sales";
import { formatDOPFromCents } from "@/lib/format-currency";
import { ORDER_STATUS_TONE } from "@/lib/orders/labels";
import { formatRdDay, SALES_PRESETS } from "@/lib/sales-range";

const fmt = formatDOPFromCents;

function csvDownload(report: SalesReport) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const money = (c: number) => (c / 100).toFixed(2);
  const lines: string[] = [
    `Reporte de ventas,${report.from} a ${report.to},${report.basis === "pagadas" ? "Solo pagadas" : "Todas (no canceladas)"}`,
    "",
    "Pedido,Fecha,Cliente,Teléfono,Estado,Pagado,Método,Producto,Variante,Cantidad,Precio unitario,Subtotal línea,Descuento pedido,Envío pedido,Total pedido",
  ];
  for (const o of report.orders) {
    o.items.forEach((it, i) => {
      lines.push(
        [
          `#${o.number}`,
          new Date(o.createdAt).toLocaleString("es-DO"),
          o.customer,
          o.phone ?? "",
          o.statusLabel,
          o.paid ? "Sí" : "No",
          o.paymentMethod,
          it.name,
          it.variant || "Única",
          it.quantity,
          money(it.unitPriceCents),
          money(it.unitPriceCents * it.quantity),
          i === 0 ? money(o.discountCents) : "",
          i === 0 ? money(o.shippingCents) : "",
          i === 0 ? money(o.totalCents) : "",
        ]
          .map(esc)
          .join(","),
      );
    });
  }
  const t = report.totals;
  lines.push(
    "",
    `Pedidos,${t.orders}`,
    `Unidades,${t.units}`,
    `Subtotal productos,${money(t.subtotalCents)}`,
    `Descuentos,${money(t.discountCents)}`,
    `Envíos cobrados,${money(t.shippingCents)}`,
    `Total vendido,${money(t.totalCents)}`,
    `Costo de mercancía,${money(t.costCents)}`,
    `Ganancia bruta,${money(t.profitCents)}`,
  );
  const blob = new Blob([`﻿${lines.join("\n")}`], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ventas-${report.from}_${report.to}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function SalesReportClient({
  report,
  preset,
}: {
  report: SalesReport;
  preset: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [from, setFrom] = useState(report.from);
  const [to, setTo] = useState(report.to);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const t = report.totals;

  const go = (params: Record<string, string>) => {
    const sp = new URLSearchParams(params);
    if (report.basis === "todas" && !params.base) sp.set("base", "todas");
    start(() => router.push(`${pathname}?${sp.toString()}`, { scroll: false }));
  };
  const currentQuery = () => {
    const sp = new URLSearchParams(
      preset ? { periodo: preset } : { desde: report.from, hasta: report.to },
    );
    if (report.basis === "todas") sp.set("base", "todas");
    return sp.toString();
  };
  const setBasis = (basis: "pagadas" | "todas") => {
    const sp = new URLSearchParams(
      preset ? { periodo: preset } : { desde: report.from, hasta: report.to },
    );
    if (basis === "todas") sp.set("base", "todas");
    start(() => router.push(`${pathname}?${sp.toString()}`, { scroll: false }));
  };

  const pdfHref = `/api/admin/ventas/pdf?${currentQuery()}`;
  const daily = report.byDay.map((d) => ({
    label: formatRdDay(d.day).replace(/ de /g, " "),
    value: Math.round(d.totalCents / 100),
  }));
  const dailyOrders = report.byDay.map((d) => ({
    label: formatRdDay(d.day).replace(/ de /g, " "),
    value: d.orders,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reporte de ventas"
        description={`Del ${formatRdDay(report.from)} al ${formatRdDay(report.to)} · ${
          report.basis === "pagadas"
            ? "solo pedidos cobrados"
            : "todos los pedidos no cancelados (cobrados y por cobrar)"
        }`}
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Ventas" }]}
        actions={
          <>
            <button
              type="button"
              onClick={() => csvDownload(report)}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary"
            >
              <Download className="size-4" aria-hidden />
              CSV
            </button>
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener"
              className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <FileText className="size-4" aria-hidden />
              Exportar PDF
            </a>
          </>
        }
      />

      {/* Filtros */}
      <AdminCard className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {SALES_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => go({ periodo: p.value })}
                aria-pressed={preset === p.value}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  preset === p.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:border-primary/60"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              go({ desde: from, hasta: to });
            }}
          >
            <label className="text-xs text-muted-foreground">
              Desde
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 block h-9 rounded-[10px] border border-border bg-background px-2 text-sm text-foreground"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Hasta
              <input
                type="date"
                value={to}
                min={from}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 block h-9 rounded-[10px] border border-border bg-background px-2 text-sm text-foreground"
              />
            </label>
            <button
              type="submit"
              className="h-9 rounded-[10px] border border-border px-3 text-sm font-medium hover:border-primary"
            >
              Aplicar
            </button>
          </form>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4 text-xs">
          <span className="text-muted-foreground">Contar como venta:</span>
          {(
            [
              ["pagadas", "Solo pedidos cobrados"],
              ["todas", "Todos los no cancelados"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setBasis(v)}
              aria-pressed={report.basis === v}
              className={`rounded-full border px-3 py-1 font-medium transition-colors ${
                report.basis === v
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground/50"
              }`}
            >
              {label}
            </button>
          ))}
          {pending ? <span className="text-muted-foreground">Actualizando…</span> : null}
        </div>
      </AdminCard>

      {/* Sumatorias */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total vendido"
          value={fmt(t.totalCents)}
          sub={`${t.orders} pedidos`}
          icon={<Wallet className="size-4" />}
          accent
          valueSize="sm"
        />
        <StatCard
          label="Ganancia bruta"
          value={fmt(t.profitCents)}
          sub={`Margen ${t.marginPct.toFixed(1)}%`}
          icon={<TrendingUp className="size-4" />}
          valueTone={t.profitCents < 0 ? "danger" : "default"}
          valueSize="sm"
        />
        <StatCard
          label="Unidades vendidas"
          value={t.units.toLocaleString("es-DO")}
          sub={`${report.byProduct.length} productos distintos`}
          icon={<Package className="size-4" />}
        />
        <StatCard
          label="Ticket promedio"
          value={fmt(t.avgOrderCents)}
          sub="por pedido"
          icon={<Receipt className="size-4" />}
          valueSize="sm"
        />
      </div>

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle>Desglose del periodo</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["Subtotal de productos", fmt(t.subtotalCents), ShoppingCart],
                ["Descuentos (cupones)", `−${fmt(t.discountCents)}`, Percent],
                ["Envíos cobrados", fmt(t.shippingCents), Truck],
                ["Total vendido", fmt(t.totalCents), Wallet],
                ["Costo de la mercancía", `−${fmt(t.costCents)}`, Package],
                ["Ganancia bruta (sin envío)", fmt(t.profitCents), TrendingUp],
              ] as const
            ).map(([label, value, Icon]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border-b border-border/60 pb-2"
              >
                <dt className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="size-4" aria-hidden />
                  {label}
                </dt>
                <dd className="font-mono font-semibold tabular-nums text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link
              href="/admin/pedidos?estado=pending"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700 hover:underline"
            >
              <Banknote className="size-3.5" aria-hidden />
              {t.unpaidOrders} pedidos por cobrar · {fmt(t.unpaidCents)}
            </Link>
            <Link
              href="/admin/pedidos?estado=cancelled"
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground hover:underline"
            >
              {t.cancelledOrders} cancelados en el periodo
            </Link>
          </div>
          {t.costCents === 0 && t.orders > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              La ganancia supone costo 0: completa el campo «Costo» de tus
              productos en el catálogo para ver la ganancia real.
            </p>
          ) : null}
        </AdminCardContent>
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Ventas por día"
          description="Total vendido (RD$)"
          className="lg:col-span-2"
        >
          <RevenueAreaChart data={daily} format="dop-compact" seriesName="Ventas" />
        </ChartCard>
        <ChartCard title="Por método de pago" description="Total por método">
          <DonutChart
            data={report.byPaymentMethod.map((m) => ({
              name: m.method,
              value: Math.round(m.totalCents / 100),
            }))}
            format="dop-compact"
            centerLabel="Pedidos"
            centerValue={String(t.orders)}
          />
        </ChartCard>
      </div>

      <ChartCard title="Pedidos por día" description="Cantidad de pedidos">
        <BarsChart data={dailyOrders} height={200} />
      </ChartCard>

      {/* Productos vendidos */}
      <AdminCard className="overflow-hidden">
        <AdminCardHeader>
          <AdminCardTitle>Detalle de lo vendido por producto</AdminCardTitle>
          <span className="text-xs text-muted-foreground">
            {report.byProduct.length} líneas
          </span>
        </AdminCardHeader>
        {report.byProduct.length === 0 ? (
          <EmptyState title="Sin ventas" description="No hay ventas en este periodo." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Variante</th>
                  <th className="px-4 py-3 text-right font-medium">Unidades</th>
                  <th className="px-4 py-3 text-right font-medium">Ventas</th>
                  <th className="px-4 py-3 text-right font-medium">Costo</th>
                  <th className="px-4 py-3 text-right font-medium">Ganancia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.byProduct.map((p) => (
                  <tr key={p.key} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium text-foreground">{p.productName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.variant}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{p.units}</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums">{fmt(p.revenueCents)}</td>
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-muted-foreground">{fmt(p.costCents)}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold tabular-nums">{fmt(p.profitCents)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border bg-muted/30 font-semibold">
                <tr>
                  <td className="px-4 py-3" colSpan={2}>Total</td>
                  <td className="px-4 py-3 text-right tabular-nums">{t.units}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{fmt(t.subtotalCents)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{fmt(t.costCents)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {fmt(t.subtotalCents - t.costCents)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Pedidos del periodo */}
      <AdminCard className="overflow-hidden">
        <AdminCardHeader>
          <AdminCardTitle>Pedidos incluidos</AdminCardTitle>
          <span className="text-xs text-muted-foreground">
            Clic en un pedido para ver sus productos
          </span>
        </AdminCardHeader>
        {report.orders.length === 0 ? (
          <EmptyState title="Sin pedidos" description="No hay pedidos en este periodo." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Pedido</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Método</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.orders.map((o) => (
                  <Fragment key={o.id}>
                    <tr
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setOpenOrder(openOrder === o.id ? null : o.id)}
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/admin/pedidos/${o.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono font-semibold text-primary hover:underline"
                        >
                          #{o.number}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString("es-DO", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-2.5">{o.customer}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{o.paymentMethod}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <AdminBadge tone={ORDER_STATUS_TONE[o.status] ?? "neutral"}>
                            {o.statusLabel}
                          </AdminBadge>
                          <AdminBadge tone={o.paid ? "success" : "warning"}>
                            {o.paid ? "Pagado" : "Por cobrar"}
                          </AdminBadge>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold tabular-nums">
                        {fmt(o.totalCents)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <ChevronDown
                          className={`ml-auto size-4 text-muted-foreground transition-transform ${
                            openOrder === o.id ? "rotate-180" : ""
                          }`}
                          aria-hidden
                        />
                      </td>
                    </tr>
                    {openOrder === o.id ? (
                      <tr className="bg-muted/20">
                        <td colSpan={7} className="px-6 py-3">
                          <ul className="space-y-1 text-sm">
                            {o.items.map((it, i) => (
                              <li
                                // biome-ignore lint/suspicious/noArrayIndexKey: líneas sin id
                                key={i}
                                className="flex justify-between gap-4"
                              >
                                <span>
                                  {it.quantity} × {it.name}
                                  {it.variant ? (
                                    <span className="text-muted-foreground"> ({it.variant})</span>
                                  ) : null}
                                </span>
                                <span className="font-mono tabular-nums">
                                  {fmt(it.unitPriceCents * it.quantity)}
                                </span>
                              </li>
                            ))}
                            <li className="flex justify-between gap-4 border-t border-border pt-1 text-muted-foreground">
                              <span>
                                Envío {fmt(o.shippingCents)}
                                {o.discountCents > 0 ? ` · Descuento −${fmt(o.discountCents)}` : ""}
                              </span>
                              <span className="font-mono font-semibold text-foreground">
                                {fmt(o.totalCents)}
                              </span>
                            </li>
                          </ul>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
