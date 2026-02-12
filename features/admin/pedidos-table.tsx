"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Pedido, PedidoEstado } from "@/types";
import { useMemo, useState } from "react";

const ESTADO_LABEL: Record<PedidoEstado, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completado: "Completado",
};

const ESTADO_BADGE_VARIANT: Record<PedidoEstado, "default" | "warning" | "success"> = {
  pendiente: "warning",
  en_proceso: "default",
  completado: "success",
};

export type FilterEstado = "todos" | PedidoEstado;

const FILTER_ESTADO_OPTIONS: { value: FilterEstado; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "completado", label: "Completado" },
];

function filterPedidos(
  pedidos: Pedido[],
  searchQuery: string,
  filterEstado: FilterEstado
): Pedido[] {
  const q = searchQuery.trim().toLowerCase();
  return pedidos.filter((p) => {
    const matchSearch =
      q === "" ||
      p.id.toLowerCase().includes(q) ||
      p.cliente.toLowerCase().includes(q);
    const matchEstado =
      filterEstado === "todos" || p.estado === filterEstado;
    return matchSearch && matchEstado;
  });
}

export interface PedidosTableProps {
  pedidos: Pedido[];
  /** Si true, muestra barra de búsqueda y filtro por estado (requiere client). */
  withFilters?: boolean;
}

export function PedidosTable({ pedidos, withFilters = false }: PedidosTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<FilterEstado>("todos");

  const filtered = useMemo(
    () =>
      withFilters
        ? filterPedidos(pedidos, searchQuery, filterEstado)
        : pedidos,
    [pedidos, searchQuery, filterEstado, withFilters]
  );

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
          {filtered.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {filtered.length}{" "}
              {filtered.length === 1 ? "resultado" : "resultados"}
            </p>
          )}
        </>
      )}
      {filtered.length === 0 && withFilters ? (
        <p className="rounded-lg border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          No hay resultados con estos filtros.
        </p>
      ) : (
        <PedidosTableBody pedidos={filtered} />
      )}
    </div>
  );
}

function PedidosTableBody({ pedidos }: { pedidos: Pedido[] }) {
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm font-medium text-foreground">
                  {p.id}
                </span>
                <Badge variant={ESTADO_BADGE_VARIANT[p.estado]}>
                  {ESTADO_LABEL[p.estado]}
                </Badge>
              </div>
              <p className="mt-1 font-medium text-foreground">{p.cliente}</p>
              <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                <span>{p.items} items</span>
                <span className="tabular-nums">{p.total}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
