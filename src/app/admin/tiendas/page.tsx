import { Store } from "lucide-react";
import Link from "next/link";
import {
  AdminBadge,
  AdminCard,
  AdminPageHeader,
  EmptyState,
} from "@/components/admin/ui";
import {
  countStoresByStatus,
  listStoresAdmin,
} from "@/database/repositories/stores";
import { formatDate } from "@/lib/format-date";
import {
  isStoreStatus,
  STORE_STATUS_LABEL,
  type StoreStatus,
} from "@/lib/stores/status";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const TABS: { key: StoreStatus | "all"; label: string }[] = [
  { key: "pending", label: "Por aprobar" },
  { key: "approved", label: "Aprobadas" },
  { key: "rejected", label: "Rechazadas" },
  { key: "suspended", label: "Suspendidas" },
  { key: "all", label: "Todas" },
];

const TONE: Record<StoreStatus, "warning" | "success" | "danger" | "neutral"> =
  {
    pending: "warning",
    approved: "success",
    rejected: "danger",
    suspended: "neutral",
  };

export default async function AdminTiendasPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const rawStatus =
    typeof params.estado === "string" ? params.estado : "pending";
  const status: StoreStatus | "all" =
    rawStatus === "all" || isStoreStatus(rawStatus) ? rawStatus : "pending";
  const q = typeof params.q === "string" ? params.q : "";
  const [stores, counts] = await Promise.all([
    listStoresAdmin({ status, q }),
    countStoresByStatus(),
  ]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tiendas"
        description="Aprueba las solicitudes, revisa y suspende tiendas del marketplace."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-1.5" aria-label="Filtrar por estado">
          {TABS.map((t) => {
            const n = t.key === "all" ? total : counts[t.key];
            const active = t.key === status;
            return (
              <Link
                key={t.key}
                href={`/admin/tiendas?estado=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                <span
                  className={`rounded-full px-1.5 text-xs ${active ? "bg-background/20" : "bg-background"}`}
                >
                  {n}
                </span>
              </Link>
            );
          })}
        </nav>
        <form className="flex gap-2" action="/admin/tiendas">
          <input type="hidden" name="estado" value={status} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar nombre, correo o teléfono"
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm sm:w-72"
          />
        </form>
      </div>

      {stores.length === 0 ? (
        <EmptyState
          icon={<Store className="size-6" />}
          title={
            status === "pending"
              ? "No hay solicitudes pendientes"
              : "No hay tiendas aquí"
          }
          description="Cuando un negocio se registre en /vender aparecerá en «Por aprobar»."
        />
      ) : (
        <AdminCard className="overflow-hidden">
          <ul className="divide-y divide-border">
            {stores.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/admin/tiendas/${s.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-muted/50"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-sm font-bold text-muted-foreground">
                    {s.logoUrl ? (
                      // biome-ignore lint/performance/noImgElement: logo de tienda (URL externa)
                      <img
                        src={s.logoUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      s.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold">{s.name}</span>
                      <AdminBadge tone={TONE[s.status]} dot>
                        {STORE_STATUS_LABEL[s.status]}
                      </AdminBadge>
                      {s.isOfficial ? (
                        <AdminBadge tone="brand">Oficial</AdminBadge>
                      ) : null}
                      {s.trusted && !s.isOfficial ? (
                        <AdminBadge tone="outline">Confiable</AdminBadge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {[s.contactName, s.phone, s.email, s.province]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {s.sellsCategories.join(", ")}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right text-sm sm:block">
                    <p className="tabular-nums">
                      {s.productCount} productos · {s.orderCount} pedidos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Desde {formatDate(s.createdAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </AdminCard>
      )}
    </div>
  );
}
