import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminBadge,
  type AdminBadgeTone,
  AdminCard,
  AdminPageHeader,
} from "@/components/admin/ui";
import { getStoreById, getStoreHistory } from "@/database/repositories/stores";
import { formatDOPFromCents } from "@/lib/format-currency";
import { formatDate, formatDateTime } from "@/lib/format-date";
import {
  isStoreStatus,
  STORE_STATUS_LABEL,
  type StoreStatus,
} from "@/lib/stores/status";
import { createServiceClient } from "@/lib/supabase/server";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { StoreReviewActions } from "./StoreReviewActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

const TONE: Record<StoreStatus, AdminBadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  suspended: "neutral",
};

async function storeStats(storeId: string) {
  const supabase = createServiceClient();
  const [{ count: products }, { count: pendingProducts }, { data: orders }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("store_id", storeId)
        .is("deleted_at", null),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("store_id", storeId)
        .is("deleted_at", null)
        .eq("moderation_status", "pending"),
      supabase
        .from("orders")
        .select("total_cents, status")
        .eq("store_id", storeId),
    ]);
  const list = (orders ?? []) as { total_cents: number; status: string }[];
  const sold = list
    .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((a, o) => a + (o.total_cents ?? 0), 0);
  return {
    products: products ?? 0,
    pendingProducts: pendingProducts ?? 0,
    orders: list.length,
    sold,
  };
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "") return null;
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{value}</dd>
    </div>
  );
}

export default async function AdminTiendaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const store = await getStoreById(id);
  if (!store) notFound();
  const [history, stats] = await Promise.all([
    getStoreHistory(id),
    storeStats(id),
  ]);
  const wa = store.whatsapp ? normalizeWhatsAppNumber(store.whatsapp) : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={store.name}
        breadcrumbs={[
          { label: "Tiendas", href: "/admin/tiendas" },
          { label: store.name },
        ]}
        actions={
          store.status === "approved" ? (
            <Link
              href={`/tiendas/${store.slug}`}
              target="_blank"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium hover:bg-muted"
            >
              Ver tienda <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <AdminCard className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-lg font-bold text-muted-foreground">
                {store.logoUrl ? (
                  // biome-ignore lint/performance/noImgElement: logo de tienda (URL externa)
                  <img
                    src={store.logoUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  store.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminBadge tone={TONE[store.status]} dot>
                    {STORE_STATUS_LABEL[store.status]}
                  </AdminBadge>
                  {store.isOfficial ? (
                    <AdminBadge tone="brand">Oficial</AdminBadge>
                  ) : null}
                  {store.trusted ? (
                    <AdminBadge tone="outline">Confiable</AdminBadge>
                  ) : null}
                  {store.isFeatured ? (
                    <AdminBadge tone="outline">Destacada</AdminBadge>
                  ) : null}
                </div>
                {store.tagline ? (
                  <p className="mt-2 text-sm font-medium">{store.tagline}</p>
                ) : null}
                {store.description ? (
                  <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                    {store.description}
                  </p>
                ) : null}
              </div>
            </div>
            {store.statusReason ? (
              <p className="mt-4 rounded-xl bg-muted px-3 py-2 text-sm">
                <strong>Motivo registrado:</strong> {store.statusReason}
              </p>
            ) : null}
          </AdminCard>

          <AdminCard className="p-5">
            <h2 className="mb-2 text-sm font-semibold">
              Datos de la solicitud
            </h2>
            <dl className="divide-y divide-border">
              <Row
                label="Tipo"
                value={
                  store.businessType === "company"
                    ? "Empresa"
                    : "Persona física"
                }
              />
              <Row label="Razón social" value={store.legalName} />
              <Row
                label={store.businessType === "company" ? "RNC" : "Cédula"}
                value={store.taxId}
              />
              <Row label="Contacto" value={store.contactName} />
              <Row label="Teléfono" value={store.phone} />
              <Row
                label="WhatsApp"
                value={
                  wa ? (
                    <a
                      className="text-primary hover:underline"
                      href={`https://wa.me/${wa}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {store.whatsapp}
                    </a>
                  ) : null
                }
              />
              <Row label="Correo" value={store.email} />
              <Row label="Avisos de pedidos" value={store.notificationEmail} />
              <Row
                label="Ubicación"
                value={[store.address, store.city, store.province]
                  .filter(Boolean)
                  .join(", ")}
              />
              <Row label="Vende" value={store.sellsCategories.join(", ")} />
              <Row label="Instagram" value={store.instagram} />
              <Row label="Facebook" value={store.facebook} />
              <Row label="Sitio web" value={store.website} />
              <Row label="Nota" value={store.applicationNote} />
              <Row
                label="Aceptó políticas"
                value={
                  store.acceptedPoliciesAt
                    ? formatDateTime(store.acceptedPoliciesAt)
                    : "No"
                }
              />
              <Row label="Solicitada" value={formatDateTime(store.createdAt)} />
            </dl>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Acciones</h2>
            <StoreReviewActions
              storeId={store.id}
              status={store.status}
              isOfficial={store.isOfficial}
              trusted={store.trusted}
              isFeatured={store.isFeatured}
            />
          </AdminCard>

          <AdminCard className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Actividad</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Productos</dt>
                <dd className="text-lg font-semibold tabular-nums">
                  <Link
                    href={`/admin/catalogo?tienda=${store.id}`}
                    className="hover:underline"
                  >
                    {stats.products}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Por moderar</dt>
                <dd className="text-lg font-semibold tabular-nums">
                  {stats.pendingProducts > 0 ? (
                    <Link
                      href="/admin/moderacion"
                      className="text-primary hover:underline"
                    >
                      {stats.pendingProducts}
                    </Link>
                  ) : (
                    0
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Pedidos</dt>
                <dd className="text-lg font-semibold tabular-nums">
                  <Link
                    href={`/admin/pedidos?tienda=${store.id}`}
                    className="hover:underline"
                  >
                    {stats.orders}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Vendido</dt>
                <dd className="text-lg font-semibold tabular-nums">
                  {formatDOPFromCents(stats.sold)}
                </dd>
              </div>
            </dl>
          </AdminCard>

          <AdminCard className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Historial</h2>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin cambios registrados.
              </p>
            ) : (
              <ol className="space-y-3 text-sm">
                {history.map((h) => (
                  <li key={h.id}>
                    <p className="font-medium">
                      {isStoreStatus(h.status)
                        ? STORE_STATUS_LABEL[h.status]
                        : h.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(h.createdAt)}
                    </p>
                    {h.reason ? (
                      <p className="mt-0.5 text-muted-foreground">{h.reason}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
