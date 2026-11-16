"use client";

import { usePanelBase } from "@/lib/panel-base";
import {
  AlertTriangle,
  Boxes,
  Download,
  Loader2,
  Minus,
  PackageX,
  Pencil,
  Plus,
  Search,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  AdminBadge,
  AdminCard,
  AdminPageHeader,
  EmptyState,
  StatCard,
} from "@/components/admin/ui";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import type {
  InventoryRow,
  InventorySummary,
} from "@/database/repositories/inventory-admin";
import { LOW_STOCK_THRESHOLD } from "@/lib/inventory";
import { adminSetVariantStock } from "@/lib/actions/inventory-admin";
import { formatDOPFromCents } from "@/lib/format-currency";

type Filter = "todos" | "bajo" | "agotado" | "reservado" | "sin-rastreo";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "bajo", label: `Stock bajo (≤${LOW_STOCK_THRESHOLD})` },
  { value: "agotado", label: "Agotados" },
  { value: "reservado", label: "Con reservas" },
  { value: "sin-rastreo", label: "Sin inventario" },
];

function matches(r: InventoryRow, f: Filter): boolean {
  switch (f) {
    case "bajo":
      return r.tracked && r.available > 0 && r.available <= LOW_STOCK_THRESHOLD;
    case "agotado":
      return r.tracked && r.available === 0;
    case "reservado":
      return r.reserved > 0;
    case "sin-rastreo":
      return !r.tracked;
    default:
      return true;
  }
}

function variantLabel(r: InventoryRow): string {
  return [r.size, r.color].filter(Boolean).join(" · ") || "Única";
}

function downloadCsv(rows: InventoryRow[]) {
  const head = [
    "Producto",
    "Variante",
    "SKU",
    "Categoría",
    "Marca",
    "Precio",
    "Costo",
    "Existencia",
    "Reservado",
    "Disponible",
    "Valor a costo",
  ];
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((r) =>
    [
      r.productName,
      variantLabel(r),
      r.sku ?? "",
      r.categoryName ?? "",
      r.brandName ?? "",
      (r.priceCents / 100).toFixed(2),
      (r.costCents / 100).toFixed(2),
      r.quantity,
      r.reserved,
      r.available,
      ((r.quantity * r.costCents) / 100).toFixed(2),
    ]
      .map(esc)
      .join(","),
  );
  const blob = new Blob([`﻿${[head.join(","), ...lines].join("\n")}`], {
    type: "text/csv;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `inventario-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function StockEditor({ row }: { row: InventoryRow }) {
  const router = useRouter();
  const { showError } = useAdminFeedback();
  const [value, setValue] = useState(String(row.quantity));
  const [pending, start] = useTransition();
  const dirty = value !== String(row.quantity);

  const save = (next: number) => {
    if (!Number.isInteger(next) || next < 0) {
      showError("La existencia debe ser un número entero ≥ 0.");
      setValue(String(row.quantity));
      return;
    }
    setValue(String(next));
    start(async () => {
      const res = await adminSetVariantStock(row.variantId, next);
      if (!res.ok) {
        showError(res.error);
        setValue(String(row.quantity));
        return;
      }
      router.refresh();
    });
  };

  const current = Number.parseInt(value, 10);
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Restar 1 a ${row.productName}`}
        disabled={pending || !(current > 0)}
        onClick={() => save((Number.isFinite(current) ? current : 0) - 1)}
        className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        aria-label={`Existencia de ${row.productName} ${variantLabel(row)}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => dirty && save(Number.parseInt(value, 10))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === "Escape") setValue(String(row.quantity));
        }}
        className={`h-7 w-16 rounded-md border bg-background px-2 text-center text-sm tabular-nums focus:border-primary focus:outline-none ${
          dirty ? "border-primary" : "border-border"
        }`}
      />
      <button
        type="button"
        aria-label={`Sumar 1 a ${row.productName}`}
        disabled={pending}
        onClick={() => save((Number.isFinite(current) ? current : 0) + 1)}
        className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
      {pending ? (
        <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-hidden />
      ) : null}
    </div>
  );
}

export function InventoryClient({
  rows,
  summary,
  initialFilter,
  initialQuery,
}: {
  rows: InventoryRow[];
  summary: InventorySummary;
  initialFilter: string;
  initialQuery: string;
}) {
  const panelBase = usePanelBase();
  const [filter, setFilter] = useState<Filter>(
    (FILTERS.some((f) => f.value === initialFilter)
      ? initialFilter
      : "todos") as Filter,
  );
  const [query, setQuery] = useState(initialQuery);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        matches(r, filter) &&
        (!q ||
          [r.productName, r.sku, r.size, r.color, r.brandName, r.categoryName]
            .filter(Boolean)
            .some((v) => (v as string).toLowerCase().includes(q))),
    );
  }, [rows, filter, query]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      todos: rows.length,
      bajo: 0,
      agotado: 0,
      reservado: 0,
      "sin-rastreo": 0,
    };
    for (const r of rows) {
      for (const f of FILTERS) if (f.value !== "todos" && matches(r, f.value)) c[f.value] += 1;
    }
    return c;
  }, [rows]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Inventario"
        description="Existencias por producto y variante. Edita el número y pulsa Enter (o usa − / +). Lo reservado son unidades en pedidos abiertos; al marcar un pedido como Entregado se descuenta de la existencia y al cancelarlo se libera."
        breadcrumbs={[{ label: "Dashboard", href: `${panelBase}` }, { label: "Inventario" }]}
        actions={
          <button
            type="button"
            onClick={() => downloadCsv(visible)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary"
          >
            <Download className="size-4" aria-hidden />
            Exportar CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Unidades en bodega"
          value={summary.units.toLocaleString("es-DO")}
          sub={`${summary.availableUnits.toLocaleString("es-DO")} disponibles · ${summary.reservedUnits} reservadas`}
          icon={<Boxes className="size-4" />}
          accent
        />
        <StatCard
          label="Valor a costo"
          value={formatDOPFromCents(summary.costValueCents)}
          sub={`A precio de venta: ${formatDOPFromCents(summary.retailValueCents)}`}
          icon={<Wallet className="size-4" />}
          valueSize="sm"
        />
        <button type="button" className="text-left" onClick={() => setFilter("agotado")}>
          <StatCard
            label="Agotados"
            value={summary.outOfStock}
            sub="Ver variantes sin stock"
            icon={<PackageX className="size-4" />}
            valueTone={summary.outOfStock > 0 ? "danger" : "default"}
          />
        </button>
        <button type="button" className="text-left" onClick={() => setFilter("bajo")}>
          <StatCard
            label="Stock bajo"
            value={summary.lowStock}
            sub={`${LOW_STOCK_THRESHOLD} unidades o menos`}
            icon={<AlertTriangle className="size-4" />}
          />
        </button>
      </div>

      <AdminCard className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:border-primary/60"
                }`}
              >
                {f.label}{" "}
                <span className="tabular-nums opacity-70">{counts[f.value]}</span>
              </button>
            ))}
          </div>
          <label className="relative block lg:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar producto, SKU, marca…"
              className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
            />
          </label>
        </div>

        {visible.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Sin resultados"
              description="No hay variantes que coincidan con el filtro o la búsqueda."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium">Variante</th>
                  <th className="px-4 py-3 font-medium text-right">Precio</th>
                  <th className="px-4 py-3 font-medium text-right">Costo</th>
                  <th className="px-4 py-3 font-medium">Existencia</th>
                  <th className="px-4 py-3 font-medium text-right">Reservado</th>
                  <th className="px-4 py-3 font-medium text-right">Disponible</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((r) => (
                  <tr key={r.variantId} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {r.coverImage ? (
                            // biome-ignore lint/performance/noImgElement: miniatura de cualquier origen
                            <img src={r.coverImage} alt="" className="size-full object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`${panelBase}/catalogo/${r.productSlug}/editar`}
                            className="line-clamp-1 font-medium text-foreground hover:text-primary"
                          >
                            {r.productName}
                          </Link>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {[r.brandName, r.categoryName].filter(Boolean).join(" · ") || "—"}
                            {!r.productActive ? " · Oculto" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{variantLabel(r)}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{r.sku ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {formatDOPFromCents(r.priceCents)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                      {r.costCents ? formatDOPFromCents(r.costCents) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StockEditor key={`${r.variantId}:${r.quantity}`} row={r} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {r.reserved > 0 ? (
                        <Link
                          href={`${panelBase}/pedidos?estado=pending`}
                          className="text-amber-700 hover:underline"
                        >
                          {r.reserved}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!r.tracked ? (
                        <AdminBadge tone="neutral">Sin rastreo</AdminBadge>
                      ) : r.available === 0 ? (
                        <AdminBadge tone="danger" dot>
                          Agotado
                        </AdminBadge>
                      ) : r.available <= LOW_STOCK_THRESHOLD ? (
                        <AdminBadge tone="warning" dot>
                          {r.available}
                        </AdminBadge>
                      ) : (
                        <AdminBadge tone="success" dot>
                          {r.available}
                        </AdminBadge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`${panelBase}/catalogo/${r.productSlug}/editar`}
                        aria-label={`Editar ${r.productName}`}
                        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Mostrando {visible.length} de {rows.length} variantes.
        </p>
      </AdminCard>
    </div>
  );
}
