"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  FilterEstado,
  Pedido,
  PedidoEstado,
  PedidosTableBodyProps,
  PedidosTableProps,
} from "@/types";

const ESTADO_LABEL: Record<PedidoEstado, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completado: "Completado",
};

const ESTADO_BADGE_VARIANT: Record<
  PedidoEstado,
  "default" | "warning" | "success"
> = {
  pendiente: "warning",
  en_proceso: "default",
  completado: "success",
};

const FILTER_ESTADO_OPTIONS: { value: FilterEstado; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "abiertos", label: "Abiertos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "completado", label: "Completado" },
];

function estadoMatches(
  filterEstado: FilterEstado,
  pedidoEstado: PedidoEstado,
): boolean {
  if (filterEstado === "todos") return true;
  if (filterEstado === "abiertos") {
    return pedidoEstado === "pendiente" || pedidoEstado === "en_proceso";
  }
  return pedidoEstado === filterEstado;
}

function filterPedidos(
  pedidos: Pedido[],
  searchQuery: string,
  filterEstado: FilterEstado,
): Pedido[] {
  const q = searchQuery.trim().toLowerCase();
  return pedidos.filter((p) => {
    const matchSearch =
      q === "" ||
      p.id.toLowerCase().includes(q) ||
      p.cliente.toLowerCase().includes(q);
    return matchSearch && estadoMatches(filterEstado, p.estado);
  });
}

function toggleSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function PedidosTable({
  pedidos,
  withFilters = false,
  initialFilterEstado = "todos",
  onMarkEnProceso,
  onMarkCompletado,
}: PedidosTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] =
    useState<FilterEstado>(initialFilterEstado);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () =>
      withFilters ? filterPedidos(pedidos, searchQuery, filterEstado) : pedidos,
    [pedidos, searchQuery, filterEstado, withFilters],
  );

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => toggleSet(prev, id));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(filtered.map((p) => p.id)) : new Set());
  };

  const handleMarkEnProceso = () => {
    const ids = Array.from(selectedIds);
    onMarkEnProceso?.(ids);
    setSelectedIds(new Set());
  };

  const handleMarkCompletado = () => {
    const ids = Array.from(selectedIds);
    const n = ids.length;
    const message =
      n === 1
        ? "¿Marcar 1 pedido como completado?"
        : `¿Marcar ${n} pedidos como completados?`;
    if (!confirm(message)) return;
    onMarkCompletado?.(ids);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-4">
      {withFilters && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 sm:max-w-xs">
              <Input
                type="search"
                placeholder="Buscar por ID o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Buscar por ID o cliente"
              />
            </div>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as FilterEstado)}
              aria-label="Filtrar por estado"
              className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {FILTER_ESTADO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {filtered.length > 0 && (
              <p className="text-muted-foreground">
                {filtered.length}{" "}
                {filtered.length === 1 ? "resultado" : "resultados"}
              </p>
            )}
            {selectedIds.size > 0 && (
              <p className="font-medium text-foreground">
                {selectedIds.size}{" "}
                {selectedIds.size === 1 ? "seleccionado" : "seleccionados"}
              </p>
            )}
          </div>
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <button
                type="button"
                onClick={handleMarkEnProceso}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Marcar en proceso
              </button>
              <button
                type="button"
                onClick={handleMarkCompletado}
                className="inline-flex h-9 items-center justify-center rounded-md border-2 border-border bg-transparent px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Marcar completado
              </button>
            </div>
          )}
        </>
      )}
      {filtered.length === 0 && withFilters ? (
        <p className="rounded-lg border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          No hay resultados con estos filtros.
        </p>
      ) : (
        <PedidosTableBody
          pedidos={filtered}
          selectedIds={selectedIds}
          onToggleRow={handleToggleRow}
          onSelectAll={handleSelectAll}
        />
      )}
    </div>
  );
}

function PedidosTableBody({
  pedidos,
  selectedIds,
  onToggleRow,
  onSelectAll,
}: PedidosTableBodyProps) {
  const selectAllRef = useRef<HTMLInputElement>(null);
  const allChecked =
    pedidos.length > 0 && pedidos.every((p) => selectedIds.has(p.id));
  const someChecked = selectedIds.size > 0;

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someChecked && !allChecked;
  }, [someChecked, allChecked]);

  if (pedidos.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
        No hay pedidos
      </p>
    );
  }

  return (
    <>
      {/* Desktop: tabla */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th scope="col" className="w-10 px-2 py-3">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  aria-label="Seleccionar todos los pedidos visibles"
                  className="size-4 rounded border-border"
                />
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-foreground">
                ID
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-foreground">
                Cliente
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-foreground">
                Items
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-foreground">
                Total
              </th>
              <th scope="col" className="px-4 py-3 font-medium text-foreground">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr
                key={p.id}
                className="border-b border-border transition-colors hover:bg-muted/30"
              >
                <td className="w-10 px-2 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => onToggleRow(p.id)}
                    aria-label={`Seleccionar pedido ${p.id}`}
                    className="size-4 rounded border-border"
                  />
                </td>
                <td className="px-4 py-3 font-mono text-foreground">{p.id}</td>
                <td className="px-4 py-3 text-foreground">{p.cliente}</td>
                <td className="px-4 py-3 tabular-nums text-foreground">
                  {p.items}
                </td>
                <td className="px-4 py-3 tabular-nums text-foreground">
                  {p.total}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ESTADO_BADGE_VARIANT[p.estado]}>
                    {ESTADO_LABEL[p.estado]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil: cards */}
      <div className="grid gap-3 md:hidden">
        {pedidos.map((p) => (
          <Card key={p.id} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(p.id)}
                  onChange={() => onToggleRow(p.id)}
                  aria-label={`Seleccionar pedido ${p.id}`}
                  className="mt-0.5 size-4 shrink-0 rounded border-border"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm font-medium text-foreground">
                      {p.id}
                    </span>
                    <Badge variant={ESTADO_BADGE_VARIANT[p.estado]}>
                      {ESTADO_LABEL[p.estado]}
                    </Badge>
                  </div>
                  <p className="mt-1 font-medium text-foreground">
                    {p.cliente}
                  </p>
                  <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                    <span>{p.items} items</span>
                    <span className="tabular-nums">{p.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
