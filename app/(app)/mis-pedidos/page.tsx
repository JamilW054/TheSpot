import { PageLayout } from "@/components/layout";
import { getOrders } from "@/lib/db";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completado: "Completado",
};

export default async function MisPedidosPage() {
  const orders = await getOrders();
  return (
    <PageLayout title="Mis pedidos">
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">Aún no tienes pedidos.</p>
          <Link
            href="/catalogo"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/mis-pedidos/${order.id}`}
                className="block rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/20"
              >
                <span className="font-mono text-xs text-muted-foreground">{order.id.slice(0, 8)}…</span>
                <p className="mt-1 font-semibold text-foreground">{order.total}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{order.createdAt}</p>
                <span className="mt-2 inline-block rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground">
                  {STATUS_LABELS[order.estado] ?? order.estado}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  );
}
