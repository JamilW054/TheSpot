import { createServiceClient } from "@/lib/supabase/server";

import { LOW_STOCK_THRESHOLD } from "@/lib/inventory";

export { LOW_STOCK_THRESHOLD };

export interface InventoryRow {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productActive: boolean;
  categoryName: string | null;
  brandName: string | null;
  coverImage: string | null;
  sku: string | null;
  size: string | null;
  color: string | null;
  priceCents: number;
  costCents: number;
  /** Existencia física en bodega. */
  quantity: number;
  /** Comprometido en pedidos abiertos (aún no entregados). */
  reserved: number;
  /** Disponible para vender = quantity − reserved. */
  available: number;
  /** false si la variante no tiene fila de inventario (stock no rastreado). */
  tracked: boolean;
}

export interface InventorySummary {
  variants: number;
  units: number;
  reservedUnits: number;
  availableUnits: number;
  costValueCents: number;
  retailValueCents: number;
  outOfStock: number;
  lowStock: number;
}

type Row = {
  id: string;
  sku: string | null;
  price_cents: number | null;
  attributes: Record<string, unknown> | null;
  is_active: boolean;
  inventory: { quantity: number; reserved: number; deleted_at: string | null }[] | null;
  products: {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    deleted_at: string | null;
    base_price_cents: number;
    cost_cents: number | null;
    categories: { name: string } | { name: string }[] | null;
    brands: { name: string } | { name: string }[] | null;
    product_media: { url: string; is_cover: boolean | null; sort_order: number | null }[] | null;
  } | null;
};

const one = <T,>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

export async function listInventoryAdmin(): Promise<{
  rows: InventoryRow[];
  summary: InventorySummary;
}> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "id, sku, price_cents, attributes, is_active, inventory(quantity, reserved, deleted_at), products!inner(id, name, slug, is_active, deleted_at, base_price_cents, cost_cents, categories(name), brands(name), product_media(url, is_cover, sort_order))",
    )
    .eq("is_active", true)
    .is("products.deleted_at", null)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const rows: InventoryRow[] = [];
  for (const v of (data ?? []) as unknown as Row[]) {
    const p = v.products;
    if (!p) continue;
    const inv = (v.inventory ?? []).filter((i) => !i.deleted_at);
    const quantity = inv.reduce((s, i) => s + (i.quantity ?? 0), 0);
    const reserved = inv.reduce((s, i) => s + (i.reserved ?? 0), 0);
    const media = [...(p.product_media ?? [])].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );
    const cover = media.find((m) => m.is_cover) ?? media[0];
    rows.push({
      variantId: v.id,
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      productActive: p.is_active,
      categoryName: one(p.categories)?.name ?? null,
      brandName: one(p.brands)?.name ?? null,
      coverImage: cover?.url ?? null,
      sku: v.sku,
      size: typeof v.attributes?.size === "string" ? v.attributes.size : null,
      color: typeof v.attributes?.color === "string" ? v.attributes.color : null,
      priceCents: v.price_cents ?? p.base_price_cents,
      costCents: p.cost_cents ?? 0,
      quantity,
      reserved,
      available: Math.max(0, quantity - reserved),
      tracked: inv.length > 0,
    });
  }
  rows.sort(
    (a, b) =>
      a.productName.localeCompare(b.productName, "es") ||
      (a.size ?? "").localeCompare(b.size ?? "", "es", { numeric: true }),
  );

  const summary: InventorySummary = {
    variants: rows.length,
    units: 0,
    reservedUnits: 0,
    availableUnits: 0,
    costValueCents: 0,
    retailValueCents: 0,
    outOfStock: 0,
    lowStock: 0,
  };
  for (const r of rows) {
    summary.units += r.quantity;
    summary.reservedUnits += r.reserved;
    summary.availableUnits += r.available;
    summary.costValueCents += r.quantity * r.costCents;
    summary.retailValueCents += r.quantity * r.priceCents;
    if (r.tracked && r.available === 0) summary.outOfStock += 1;
    else if (r.tracked && r.available <= LOW_STOCK_THRESHOLD) summary.lowStock += 1;
  }
  return { rows, summary };
}
