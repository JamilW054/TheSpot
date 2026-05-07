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
    <PageLayout
      title="Mis pedidos"
      description="Consulta el estado de tus pedidos y el detalle de cada uno."
    >
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">Aún no tienes pedidos.</p>
          <Link
            href="/catalogo"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/mis-pedidos/${order.id}`}
                className="block rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {order.id.slice(0, 8)}…
                </span>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {order.total}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {order.createdAt}
                </p>
                <span className="mt-3 inline-block rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground">
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
