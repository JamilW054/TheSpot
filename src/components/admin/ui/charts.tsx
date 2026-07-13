"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminCard } from "./admin-card";
import { EmptyState } from "./empty-state";

/**
 * Formato del valor en ejes, tooltips y leyendas.
 *
 * Es un string y no una función a propósito: los charts son Client Components,
 * y un Server Component no puede pasarles una función (React no sabe
 * serializarla al cruzar la frontera). Las páginas de servidor —p. ej.
 * /admin/reportes— eligen el formato por nombre y la resolución a función ocurre
 * aquí, ya en el cliente.
 */
export type ChartValueFormat = "number" | "dop-compact";

const compactDOP = new Intl.NumberFormat("es-DO", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const CHART_FORMATTERS: Record<ChartValueFormat, (value: number) => string> = {
  number: (v) => String(v),
  "dop-compact": (v) => `RD$${compactDOP.format(v)}`,
};

/**
 * `valueFormatter` (función) tiene prioridad y sigue disponible para los Client
 * Components, que sí pueden pasarla. `format` es la vía para el servidor.
 */
function resolveFormatter(
  valueFormatter: ((value: number) => string) | undefined,
  format: ChartValueFormat,
): (value: number) => string {
  return valueFormatter ?? CHART_FORMATTERS[format];
}

/* ── Paleta de series: azul Buxxep primero, apoyos desaturados ── */
export const CHART_COLORS = [
  "#3cc8f7",
  "#8b5cf6",
  "#34d399",
  "#fbbf24",
  "#f472b6",
  "#737373",
] as const;

const tooltipContentStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  boxShadow: "var(--shadow-card)",
  fontSize: 12,
  color: "var(--foreground)",
};
const tooltipLabelStyle: React.CSSProperties = {
  color: "var(--muted-foreground)",
  fontWeight: 500,
};
const tooltipItemStyle: React.CSSProperties = {
  color: "var(--foreground)",
};

export interface ChartCardProps {
  title: string;
  description?: string;
  /** Acción o filtro a la derecha del título. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Contenedor de gráfico: cabecera tipográfica + área responsiva. */
export function ChartCard({
  title,
  description,
  action,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <AdminCard className={`p-5 ${className}`.trim()}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </AdminCard>
  );
}

export interface TimeSeriesPoint {
  /** Etiqueta del eje X (fecha corta). */
  label: string;
  value: number;
}

export interface RevenueAreaChartProps {
  data: TimeSeriesPoint[];
  /** Formatea el valor del tooltip / eje Y. Solo desde Client Components. */
  valueFormatter?: (value: number) => string;
  /** Formato serializable — úsalo desde Server Components. */
  format?: ChartValueFormat;
  height?: number;
  seriesName?: string;
}

/** Área con degradado de marca — ingresos / tendencia en el tiempo. */
export function RevenueAreaChart({
  data,
  valueFormatter: valueFormatterProp,
  format = "number",
  height = 260,
  seriesName = "Ingresos",
}: RevenueAreaChartProps) {
  const valueFormatter = resolveFormatter(valueFormatterProp, format);
  if (data.length === 0) return <ChartEmpty height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="admin-area-brand" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--admin-brand)"
              stopOpacity={0.28}
            />
            <stop
              offset="100%"
              stopColor="var(--admin-brand)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v: number) => valueFormatter(v)}
        />
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
          formatter={(value) => [valueFormatter(Number(value)), seriesName]}
        />
        <Area
          type="monotone"
          dataKey="value"
          name={seriesName}
          stroke="var(--admin-brand)"
          strokeWidth={2}
          fill="url(#admin-area-brand)"
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export interface BarsChartProps {
  data: TimeSeriesPoint[];
  /** Solo desde Client Components. */
  valueFormatter?: (value: number) => string;
  /** Formato serializable — úsalo desde Server Components. */
  format?: ChartValueFormat;
  height?: number;
  seriesName?: string;
  color?: string;
}

/** Barras redondeadas — pedidos / comparativas por periodo. */
export function BarsChart({
  data,
  valueFormatter: valueFormatterProp,
  format = "number",
  height = 260,
  seriesName = "Pedidos",
  color = "var(--admin-brand)",
}: BarsChartProps) {
  const valueFormatter = resolveFormatter(valueFormatterProp, format);
  if (data.length === 0) return <ChartEmpty height={height} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
          formatter={(value) => [valueFormatter(Number(value)), seriesName]}
        />
        <Bar
          dataKey="value"
          name={seriesName}
          fill={color}
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export interface DonutSlice {
  name: string;
  value: number;
  /** Color fijo opcional (por defecto, paleta de series). */
  color?: string;
}

export interface DonutChartProps {
  data: DonutSlice[];
  height?: number;
  /** Texto central (p. ej. total). */
  centerLabel?: string;
  centerValue?: string;
  /** Solo desde Client Components. */
  valueFormatter?: (value: number) => string;
  /** Formato serializable — úsalo desde Server Components. */
  format?: ChartValueFormat;
}

/** Donut con leyenda lateral — distribución por categoría / estado. */
export function DonutChart({
  data,
  height = 220,
  centerLabel,
  centerValue,
  valueFormatter: valueFormatterProp,
  format = "number",
}: DonutChartProps) {
  const valueFormatter = resolveFormatter(valueFormatterProp, format);
  const total = data.reduce((s, d) => s + d.value, 0);
  if (data.length === 0 || total === 0) return <ChartEmpty height={height} />;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              formatter={(value, name) => [
                valueFormatter(Number(value)),
                String(name),
              ]}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="92%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((slice, i) => (
                <Cell
                  key={slice.name}
                  fill={slice.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {centerValue ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
              {centerValue}
            </span>
            {centerLabel ? (
              <span className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
                {centerLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <ul className="grid w-full min-w-0 gap-2">
        {data.map((slice, i) => {
          const pct = Math.round((slice.value / total) * 100);
          return (
            <li
              key={slice.name}
              className="flex min-w-0 items-center gap-2 text-sm"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  background:
                    slice.color ?? CHART_COLORS[i % CHART_COLORS.length],
                }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {slice.name}
              </span>
              <span className="shrink-0 font-medium tabular-nums text-foreground">
                {valueFormatter(slice.value)}
              </span>
              <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export interface RankedItem {
  name: string;
  value: number;
  /** Detalle secundario (p. ej. unidades). */
  sub?: string;
}

/** Lista clasificada con barras de progreso — top productos. */
export function RankedBarList({
  data,
  valueFormatter: valueFormatterProp,
  format = "number",
}: {
  data: RankedItem[];
  /** Solo desde Client Components. */
  valueFormatter?: (value: number) => string;
  /** Formato serializable — úsalo desde Server Components. */
  format?: ChartValueFormat;
}) {
  const valueFormatter = resolveFormatter(valueFormatterProp, format);
  if (data.length === 0)
    return (
      <EmptyState
        title="Sin datos todavía"
        description="Aparecerán en cuanto haya ventas."
      />
    );
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3.5">
      {data.map((item, i) => (
        <li key={`${item.name}-${i}`} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium text-foreground">
              {item.name}
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {item.sub ? `${item.sub} · ` : ""}
              <span className="font-medium text-foreground">
                {valueFormatter(item.value)}
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-(--admin-brand)"
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ChartEmpty({ height }: { height: number }) {
  return (
    <div
      className="flex items-center justify-center text-sm text-muted-foreground"
      style={{ height }}
    >
      Sin datos para este periodo.
    </div>
  );
}
