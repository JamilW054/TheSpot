import { formatDOPFromCents } from "@/lib/format-currency";
import type { CatalogProduct } from "@/types";

/**
 * Fila cruda del catálogo según el esquema normalizado:
 * - precio: `base_price_cents` (o el menor de las variantes activas).
 * - portada: `product_media` (is_cover o el de menor sort_order).
 * - tallas: atributo `size` de `product_variants` activas.
 * - etiquetas: `product_tags -> tags`.
 */
export interface ProductMediaRow {
  url: string;
  media_type?: string | null;
  alt_text?: string | null;
  is_cover?: boolean | null;
  sort_order?: number | null;
}

export interface ProductVariantJoinRow {
  id?: string;
  price_cents: number | null;
  attributes: Record<string, unknown> | null;
  is_active?: boolean | null;
  sort_order?: number | null;
}

export interface ProductTagJoinRow {
  tags?:
    | { slug: string; name?: string }
    | { slug: string; name?: string }[]
    | null;
}

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  /** Precio base en céntimos (DB: numeric). */
  base_price_cents: number | string | null;
  original_price_cents?: number | string | null;
  is_active?: boolean | null;
  category_id?: string | null;
  brand_id?: string | null;
  linea_id?: string | null;
  in_stock?: boolean | null;
  rating_avg?: number | string | null;
  review_count?: number | null;
  product_media?: ProductMediaRow[] | null;
  product_variants?: ProductVariantJoinRow[] | null;
  product_tags?: ProductTagJoinRow[] | null;
  categories?: { slug: string } | { slug: string }[] | null;
  brands?: { name: string } | null;
}

/** Columnas (select PostgREST) para leer un producto de catálogo con sus joins. */
export const PRODUCT_CATALOG_SELECT =
  "id, slug, name, description, base_price_cents, original_price_cents, is_active, in_stock, rating_avg, review_count, category_id, brand_id, linea_id, " +
  "product_media(url, media_type, is_cover, sort_order), " +
  "product_variants(id, price_cents, attributes, is_active, sort_order), " +
  "product_tags(tags(slug, name)), " +
  "categories(slug), " +
  "brands(name)";

/** Variante con datos completos para el admin (SKU, inventario). */
export interface AdminVariantRow {
  id: string;
  sku: string | null;
  price_cents: number | null;
  attributes: Record<string, unknown> | null;
  is_active: boolean;
  sort_order: number;
  inventory?:
    | { warehouse_id: string; quantity: number; reserved: number }[]
    | null;
}

export interface AdminProductMediaRow extends ProductMediaRow {
  id: string;
}

/** Fila de producto para el admin: incluye variantes, inventario, media y etiquetas. */
export interface AdminProductRow extends ProductRow {
  is_customizable?: boolean | null;
  meta_title?: string | null;
  meta_description?: string | null;
  product_variants?: (ProductVariantJoinRow & AdminVariantRow)[] | null;
  product_media?: AdminProductMediaRow[] | null;
}

/** Select PostgREST con todo lo necesario para editar un producto en el admin. */
export const PRODUCT_ADMIN_SELECT =
  "id, slug, name, description, base_price_cents, original_price_cents, is_active, is_customizable, in_stock, category_id, brand_id, linea_id, meta_title, meta_description, created_at, " +
  "product_media(id, url, media_type, is_cover, sort_order), " +
  "product_variants(id, sku, price_cents, attributes, is_active, sort_order, inventory(warehouse_id, quantity, reserved)), " +
  "product_tags(tags(slug, name)), " +
  "categories(slug)";

function toCents(value: number | string | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function categorySlugFromRow(
  categories: ProductRow["categories"],
): string | null {
  if (!categories) return null;
  const c = Array.isArray(categories) ? categories[0] : categories;
  return c?.slug ?? null;
}

/** Portada: media marcada como cover, o la de menor sort_order. */
export function coverFromMedia(
  media: ProductMediaRow[] | null | undefined,
): string {
  if (!media || media.length === 0) return "";
  const sorted = [...media].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  const cover = sorted.find((m) => m.is_cover) ?? sorted[0];
  return cover?.url ?? "";
}

/** Galería ordenada: cover primero, resto por sort_order. */
export function galleryFromMedia(
  media: ProductMediaRow[] | null | undefined,
): string[] {
  if (!media || media.length === 0) return [];
  const sorted = [...media].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  const cover = sorted.find((m) => m.is_cover) ?? sorted[0];
  const rest = sorted.filter((m) => m.url !== cover?.url);
  return [cover, ...rest].map((m) => m?.url ?? "").filter(Boolean);
}

/** Precio efectivo: menor precio de variante activa, o el precio base. */
export function effectivePriceCents(row: ProductRow): number {
  const variantPrices = (row.product_variants ?? [])
    .filter((v) => v.is_active !== false && v.price_cents != null)
    .map((v) => v.price_cents as number);
  if (variantPrices.length > 0) return Math.min(...variantPrices);
  return toCents(row.base_price_cents);
}

/** Tallas disponibles: atributo `size` de las variantes activas, en orden. */
export function sizesFromVariants(
  variants: ProductVariantJoinRow[] | null | undefined,
): string[] {
  if (!variants) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  const sorted = [...variants].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  for (const v of sorted) {
    if (v.is_active === false) continue;
    const size = v.attributes?.size;
    if (typeof size === "string" && size.trim() && !seen.has(size)) {
      seen.add(size);
      out.push(size);
    }
  }
  return out;
}

/** Etiquetas (slugs) de un producto a partir del join product_tags. */
export function tagsFromRow(
  productTags: ProductTagJoinRow[] | null | undefined,
): string[] {
  if (!productTags) return [];
  const out: string[] = [];
  for (const pt of productTags) {
    if (!pt.tags) continue;
    const arr = Array.isArray(pt.tags) ? pt.tags : [pt.tags];
    for (const t of arr) {
      if (t?.slug) out.push(t.slug);
    }
  }
  return out;
}

export function rowToCatalogProduct(row: ProductRow): CatalogProduct {
  const priceCents = effectivePriceCents(row);
  const originalCents = toCents(row.original_price_cents ?? null);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    price: formatDOPFromCents(priceCents),
    priceCents,
    originalPrice: originalCents > 0 ? formatDOPFromCents(originalCents) : null,
    originalPriceCents: originalCents > 0 ? originalCents : null,
    brandName: row.brands?.name ?? null,
    modelPath: null,
    coverImage: coverFromMedia(row.product_media),
    gallery: galleryFromMedia(row.product_media),
    baseTextureUrl: null,
    categorySlug: categorySlugFromRow(row.categories),
    sizes: sizesFromVariants(row.product_variants),
    tags: tagsFromRow(row.product_tags),
    ratingAvg: row.rating_avg != null ? Number(row.rating_avg) : null,
    reviewCount: row.review_count ?? 0,
  };
}
