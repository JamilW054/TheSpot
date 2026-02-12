import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Pedido, PedidoEstado } from "@/types";

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

export interface PedidosTableProps {
  pedidos: Pedido[];
}

export function PedidosTable({ pedidos }: PedidosTableProps) {
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
