import type { StoreStatus } from "@/lib/stores/status";
import { createServiceClient } from "@/lib/supabase/server";

/** Métricas del panel general de la plataforma (`/admin`). Service role. */

export interface StoreSalesRow {
  storeId: string;
  name: string;
  slug: string;
  orders: number;
  salesCents: number;
}

export interface PlatformMetrics {
  stores: Record<StoreStatus, number>;
  pendingStores: {
    id: string;
    name: string;
    createdAt: string;
    province: string | null;
  }[];
  productsPending: number;
  productsPublished: number;
  openReports: number;
  orders30d: number;
  sales30dCents: number;
  paidSales30dCents: number;
  buyers30d: number;
  topStores: StoreSalesRow[];
}

const DAY_MS = 86_400_000;

export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  const supabase = createServiceClient();
  const since = new Date(Date.now() - 30 * DAY_MS).toISOString();
  const [storesRes, pendingProds, publishedProds, reportsRes, ordersRes] =
    await Promise.all([
      supabase
        .from("stores")
        .select("id, name, slug, status, province, created_at"),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("moderation_status", "pending"),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("is_active", true)
        .eq("moderation_status", "approved"),
      supabase
        .from("product_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("orders")
        .select("store_id, status, payment_status, total_cents, contact_email")
        .gte("created_at", since)
        .limit(20000),
    ]);

  const stores = (storesRes.data ?? []) as {
    id: string;
    name: string;
    slug: string;
    status: StoreStatus;
    province: string | null;
    created_at: string;
  }[];
  const counts: Record<StoreStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  };
  for (const s of stores) counts[s.status] = (counts[s.status] ?? 0) + 1;

  const orders = (ordersRes.data ?? []) as {
    store_id: string | null;
    status: string;
    payment_status: string | null;
    total_cents: number;
    contact_email: string | null;
  }[];
  const byStore = new Map<string, { orders: number; sales: number }>();
  let sales = 0;
  let paid = 0;
  let count = 0;
  const buyers = new Set<string>();
  for (const o of orders) {
    if (o.status === "cancelled" || o.status === "refunded") continue;
    count += 1;
    sales += o.total_cents ?? 0;
    if (o.payment_status === "paid") paid += o.total_cents ?? 0;
    if (o.contact_email) buyers.add(o.contact_email.toLowerCase());
    if (o.store_id) {
      const agg = byStore.get(o.store_id) ?? { orders: 0, sales: 0 };
      agg.orders += 1;
      agg.sales += o.total_cents ?? 0;
      byStore.set(o.store_id, agg);
    }
  }
  const storeById = new Map(stores.map((s) => [s.id, s]));
  const topStores: StoreSalesRow[] = [...byStore.entries()]
    .map(([storeId, a]) => ({
      storeId,
      name: storeById.get(storeId)?.name ?? "Tienda",
      slug: storeById.get(storeId)?.slug ?? "",
      orders: a.orders,
      salesCents: a.sales,
    }))
    .sort((a, b) => b.salesCents - a.salesCents)
    .slice(0, 10);

  return {
    stores: counts,
    pendingStores: stores
      .filter((s) => s.status === "pending")
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .slice(0, 8)
      .map((s) => ({
        id: s.id,
        name: s.name,
        createdAt: s.created_at,
        province: s.province,
      })),
    productsPending: pendingProds.count ?? 0,
    productsPublished: publishedProds.count ?? 0,
    openReports: reportsRes.count ?? 0,
    orders30d: count,
    sales30dCents: sales,
    paidSales30dCents: paid,
    buyers30d: buyers.size,
    topStores,
  };
}
