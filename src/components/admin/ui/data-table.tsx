"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { AdminCard } from "./admin-card";

/* ── Búsqueda pill (DESIGN.md: Search Trigger) ────────────────────────── */

export interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
  className = "",
}: AdminSearchInputProps) {
  return (
    <label
      className={`flex h-9 min-w-0 items-center gap-2 rounded-[18px] bg-muted px-3 text-sm transition-shadow focus-within:ring-1 focus-within:ring-ring ${className}`.trim()}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full min-w-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

/* ── Select pill para filtros ─────────────────────────────────────────── */

export interface AdminFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
  className?: string;
}

export function AdminFilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
  className = "",
}: AdminFilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={`h-9 rounded-[18px] border-0 bg-muted px-3 pr-8 text-sm font-medium text-foreground outline-none transition-shadow focus:ring-1 focus:ring-ring ${className}`.trim()}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/* ── Tabla de datos genérica ──────────────────────────────────────────── */

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  /** Renderiza la celda. */
  cell: (row: T) => ReactNode;
  /** Valor para ordenar; si falta, la columna no es ordenable. */
  sortValue?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  /** Clase extra para <td>/<th> (anchos, truncados). */
  className?: string;
  /** Oculta la columna por debajo de un breakpoint (clases responsive). */
  headerClassName?: string;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  /** Estado vacío (se muestra si rows.length === 0). */
  emptyState?: ReactNode;
  /** Filas por página; 0 = sin paginación. */
  pageSize?: number;
  /** Ordenación inicial. */
  initialSort?: { key: string; dir: "asc" | "desc" };
  /** Al hacer clic en una fila. */
  onRowClick?: (row: T) => void;
  /** Etiqueta accesible de la tabla. */
  ariaLabel?: string;
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

/**
 * Tabla del admin: cabecera muted, hover por fila, ordenación por columna
 * y paginación compacta. Client-side, pensada para datasets de panel.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  emptyState,
  pageSize = 0,
  initialSort,
  onRowClick,
  ariaLabel,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(
    initialSort ?? null,
  );
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const getValue = col.sortValue;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (typeof va === "number" && typeof vb === "number")
        return (va - vb) * factor;
      return String(va).localeCompare(String(vb), "es") * factor;
    });
  }, [rows, sort, columns]);

  const pageCount =
    pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const safePage = Math.min(page, pageCount - 1);
  const visible =
    pageSize > 0
      ? sorted.slice(safePage * pageSize, (safePage + 1) * pageSize)
      : sorted;

  const toggleSort = (key: string) => {
    setPage(0);
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  if (rows.length === 0 && emptyState) {
    return <AdminCard>{emptyState}</AdminCard>;
  }

  return (
    <AdminCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse text-sm"
          aria-label={ariaLabel}
        >
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {columns.map((col) => {
                const sortable = Boolean(col.sortValue);
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      active
                        ? sort?.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={`px-4 py-3 text-xs font-medium text-muted-foreground ${alignClass[col.align ?? "left"]} ${col.headerClassName ?? col.className ?? ""}`.trim()}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={`inline-flex items-center gap-1 rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          active ? "text-foreground" : ""
                        }`.trim()}
                      >
                        {col.header}
                        {active ? (
                          sort?.dir === "asc" ? (
                            <ArrowUp className="size-3" aria-hidden />
                          ) : (
                            <ArrowDown className="size-3" aria-hidden />
                          )
                        ) : (
                          <ArrowUpDown
                            className="size-3 opacity-50"
                            aria-hidden
                          />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-border transition-colors last:border-0 hover:bg-muted/40 ${
                  onRowClick ? "cursor-pointer" : ""
                }`.trim()}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${alignClass[col.align ?? "left"]} ${col.className ?? ""}`.trim()}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageSize > 0 && sorted.length > pageSize ? (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
          <p className="text-muted-foreground">
            {safePage * pageSize + 1}–
            {Math.min((safePage + 1) * pageSize, sorted.length)} de{" "}
            {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              aria-label="Página anterior"
              className="flex size-8 items-center justify-center rounded-[18px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <span className="min-w-16 text-center tabular-nums text-muted-foreground">
              {safePage + 1} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              aria-label="Página siguiente"
              className="flex size-8 items-center justify-center rounded-[18px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </AdminCard>
  );
}
