import Link from "next/link";
import { PageLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getFacturasPedidosPagadosAdmin } from "@/lib/db";
import { Download, ShoppingCart } from "lucide-react";

const iconGhost =
  "inline-flex size-9 items-center justify-center rounded-md border-2 border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40";

export default async function AdminFacturasPage() {
  const rows = await getFacturasPedidosPagadosAdmin();

  return (
    <PageLayout
      title="Facturas / cobros confirmados"
      description="Listado de pedidos con cobro marcado como pagado en la base de datos (pasarela AZUL, etc.). La factura fiscal formal y PDF pueden integrarse después."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled
          title="Exportar CSV (próximamente)"
          aria-label="Exportar CSV"
          className={iconGhost}
        >
          <Download className="size-4" aria-hidden />
        </button>
        <Link
          href="/admin/pedidos"
          className={iconGhost}
          aria-label="Ver todos los pedidos"
          title="Todos los pedidos"
        >
          <ShoppingCart className="size-4" aria-hidden />
        </Link>
      </div>

      {rows.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay pedidos con cobro confirmado todavía.
          </CardContent>
        </Card>
      ) : (
        <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="px-4 py-3 font-medium">
                  Pedido
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Cliente
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Total
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Fecha pedido
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Fecha pago
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Estado doc.
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                  <td className="px-4 py-3">{r.cliente}</td>
                  <td className="px-4 py-3 tabular-nums">{r.total}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.fechaPedido}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.fechaPago ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="success">Pagado</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 ? (
        <div className="grid gap-3 md:hidden">
          {rows.map((r) => (
            <Card key={r.id} className="border-border">
              <CardContent className="space-y-2 p-4 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs">{r.id}</span>
                  <Badge variant="success">Pagado</Badge>
                </div>
                <p className="font-medium">{r.cliente}</p>
                <p className="tabular-nums text-foreground">{r.total}</p>
                <p className="text-xs text-muted-foreground">
                  Pedido: {r.fechaPedido}
                  <br />
                  Pago: {r.fechaPago ?? "—"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </PageLayout>
  );
}
