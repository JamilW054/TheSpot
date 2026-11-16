import { AlertTriangle, Flag, Package, ShieldAlert, ShoppingCart, Store, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { AdminCard, AdminPageHeader, EmptyState, StatCard } from "@/components/admin/ui";
import { getPlatformMetrics } from "@/database/repositories/platform-metrics";
import { formatDOPFromCents } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";

export const dynamic = "force-dynamic";

/** Panel general de la plataforma: tiendas, moderación y ventas de todo el marketplace. */
export default async function AdminPage() {
  const m = await getPlatformMetrics();
  const needsAttention = m.stores.pending + m.productsPending + m.openReports;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Panel general"
        description="Todo The Spot en un vistazo: tiendas, moderación y ventas del marketplace (últimos 30 días)."
        actions={
          <Link
            href="/panel"
            className="inline-flex h-9 items-center gap-2 rounded-[18px] border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
          >
            <Store className="size-4" aria-hidden /> Operar mi tienda
          </Link>
        }
      />

      {needsAttention > 0 ? (
        <div className="flex flex-col gap-3 rounded-3xl border border-border bg-(--admin-warning-soft) px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2.5 text-sm">
            <AlertTriangle className="size-4 text-(--admin-warning)" aria-hidden />
            Pendiente de tu revisión: {m.stores.pending} tienda(s), {m.productsPending} producto(s) y {m.openReports} denuncia(s).
          </p>
          <div className="flex gap-2">
            {m.stores.pending > 0 ? (
              <Link href="/admin/tiendas?estado=pending" className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background">
                Revisar tiendas
              </Link>
            ) : null}
            {m.productsPending + m.openReports > 0 ? (
              <Link href="/admin/moderacion" className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium">
                Moderación
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ventas 30 días" value={formatDOPFromCents(m.sales30dCents)} sub={`${formatDOPFromCents(m.paidSales30dCents)} cobradas`} icon={<Wallet className="size-4" />} accent href="/admin/ventas?periodo=30d&base=todas" />
        <StatCard label="Pedidos 30 días" value={m.orders30d} sub="de todas las tiendas" icon={<ShoppingCart className="size-4" />} href="/admin/pedidos" />
        <StatCard label="Compradores" value={m.buyers30d} sub="correos distintos" icon={<Users className="size-4" />} />
        <StatCard label="Tiendas activas" value={m.stores.approved} sub={`${m.stores.suspended} suspendidas`} icon={<Store className="size-4" />} href="/admin/tiendas?estado=approved" />
        <StatCard label="Solicitudes" value={m.stores.pending} sub="tiendas por aprobar" icon={<Store className="size-4" />} href="/admin/tiendas?estado=pending" />
        <StatCard label="Productos publicados" value={m.productsPublished} sub="visibles en la tienda" icon={<Package className="size-4" />} href="/admin/catalogo" />
        <StatCard label="Por moderar" value={m.productsPending} sub="productos en revisión" icon={<ShieldAlert className="size-4" />} href="/admin/moderacion" />
        <StatCard label="Denuncias" value={m.openReports} sub="abiertas" icon={<Flag className="size-4" />} href="/admin/moderacion?tab=denuncias" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Tiendas que más venden (30 días)</h2>
            <Link href="/admin/ventas" className="text-xs text-muted-foreground hover:text-foreground">
              Reporte
            </Link>
          </div>
          {m.topStores.length === 0 ? (
            <EmptyState title="Aún no hay ventas" description="Cuando entren pedidos verás aquí el ranking de tiendas." />
          ) : (
            <ol className="divide-y divide-border">
              {m.topStores.map((s, i) => (
                <li key={s.storeId} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span className="w-5 text-muted-foreground tabular-nums">{i + 1}</span>
                  <Link href={`/admin/tiendas/${s.storeId}`} className="min-w-0 flex-1 truncate font-medium hover:underline">
                    {s.name}
                  </Link>
                  <span className="text-muted-foreground tabular-nums">{s.orders} ped.</span>
                  <span className="w-28 text-right font-mono tabular-nums">{formatDOPFromCents(s.salesCents)}</span>
                </li>
              ))}
            </ol>
          )}
        </AdminCard>

        <AdminCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Solicitudes más antiguas</h2>
            <Link href="/admin/tiendas?estado=pending" className="text-xs text-muted-foreground hover:text-foreground">
              Ver todas
            </Link>
          </div>
          {m.pendingStores.length === 0 ? (
            <EmptyState title="Sin solicitudes pendientes" description="Comparte /vender para que más negocios se registren." />
          ) : (
            <ul className="divide-y divide-border">
              {m.pendingStores.map((s) => (
                <li key={s.id}>
                  <Link href={`/admin/tiendas/${s.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-muted/50">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[s.province, formatDate(s.createdAt)].filter(Boolean).join(" · ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
