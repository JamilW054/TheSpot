import { createServiceClient } from "@/lib/supabase/server";

/** Datos de `/admin/moderacion` (service role; el llamador ya es admin). */

export interface ModerationProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number;
  coverImage: string | null;
  status: string;
  note: string | null;
  storeId: string;
  storeName: string;
  createdAt: string;
  openReports: number;
}

export interface ModerationReport {
  id: string;
  reason: string;
  details: string | null;
  reporterEmail: string | null;
  createdAt: string;
  productId: string;
  productName: string;
  productSlug: string;
  productStatus: string;
  coverImage: string | null;
  storeName: string;
}

type ProductJoin = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  base_price_cents: number;
  moderation_status: string;
  moderation_note: string | null;
  store_id: string;
  created_at: string;
  stores: { name: string } | { name: string }[] | null;
  product_media:
    | { url: string; is_cover: boolean | null; sort_order: number | null }[]
    | null;
};

const one = <T>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

function cover(media: ProductJoin["product_media"]): string | null {
  const list = [...(media ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  return (list.find((m) => m.is_cover) ?? list[0])?.url ?? null;
}

export async function getModerationQueue(
  status: "pending" | "rejected" | "blocked",
): Promise<ModerationProduct[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, base_price_cents, moderation_status, moderation_note, store_id, created_at, stores(name), product_media(url, is_cover, sort_order)",
    )
    .is("deleted_at", null)
    .eq("moderation_status", status)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as ProductJoin[];
  const ids = rows.map((r) => r.id);
  const reportCounts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: reps } = await supabase
      .from("product_reports")
      .select("product_id")
      .in("product_id", ids)
      .eq("status", "open");
    for (const r of (reps ?? []) as { product_id: string }[]) {
      reportCounts.set(r.product_id, (reportCounts.get(r.product_id) ?? 0) + 1);
    }
  }
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    priceCents: r.base_price_cents,
    coverImage: cover(r.product_media),
    status: r.moderation_status,
    note: r.moderation_note,
    storeId: r.store_id,
    storeName: one(r.stores)?.name ?? "Tienda",
    createdAt: r.created_at,
    openReports: reportCounts.get(r.id) ?? 0,
  }));
}

export async function getOpenReports(): Promise<ModerationReport[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("product_reports")
    .select(
      "id, reason, details, reporter_email, created_at, products(id, slug, name, moderation_status, stores(name), product_media(url, is_cover, sort_order))",
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  type Row = {
    id: string;
    reason: string;
    details: string | null;
    reporter_email: string | null;
    created_at: string;
    products: Omit<
      ProductJoin,
      | "description"
      | "base_price_cents"
      | "moderation_note"
      | "store_id"
      | "created_at"
    > | null;
  };
  return ((data ?? []) as unknown as Row[])
    .filter((r) => r.products)
    .map((r) => {
      const p = one(r.products) as NonNullable<Row["products"]>;
      return {
        id: r.id,
        reason: r.reason,
        details: r.details,
        reporterEmail: r.reporter_email,
        createdAt: r.created_at,
        productId: p.id,
        productName: p.name,
        productSlug: p.slug,
        productStatus: p.moderation_status,
        coverImage: cover(p.product_media),
        storeName: one(p.stores)?.name ?? "Tienda",
      };
    });
}
