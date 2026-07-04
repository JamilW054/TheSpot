import Link from "next/link";
import { Package } from "lucide-react";
import { getOrders } from "@/database/repositories";

export const metadata = {
  title: "Mis pedidos | Buxxep",
  description: "Historial de tus compras en Buxxep.",
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completado: "Completado",
  cancelado: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pendiente: "text-yellow-500 bg-yellow-500/10 border-yellow-500/25",
  en_proceso: "text-primary bg-primary/10 border-primary/25",
  completado: "text-green-500 bg-green-500/10 border-green-500/25",
  cancelado: "text-destructive bg-destructive/10 border-destructive/25",
};

export default async function PedidosPage() {
  const orders = await getOrders();

  return (
    <article className="w-full max-w-2xl px-4 sm:px-6 pb-20 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mis pedidos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historial de compras realizadas en Buxxep.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="animate-scale-in rounded-[14px] border border-border bg-card p-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
            <Package className="size-8 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Sin pedidos aún
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
            Cuando realices una compra aparecerá aquí con su estado y detalles.
          </p>
          <Link
            href="/catalogo"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <ul className="animate-stagger space-y-3">
          {orders.map((order) => {
            const statusColor =
              STATUS_COLORS[order.estado] ??
              "text-muted-foreground bg-muted/40 border-border";
            return (
              <li key={order.id}>
                <Link
                  href={`/cuenta/pedidos/${order.id}`}
                  className="group flex items-center gap-4 rounded-[14px] border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-muted/20"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Package className="size-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-muted-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {order.total}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.createdAt}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColor}`}
                  >
                    {STATUS_LABELS[order.estado] ?? order.estado}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
