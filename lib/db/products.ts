import type { CatalogProduct } from "@/types";
import { formatDOPFromCents } from "@/lib/format-currency";

export interface ProductMediaRow {
  url: string;
  media_type: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
}

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  base_price_cents: number;
  original_price_cents: number | null;
  is_active: boolean;
  is_customizable: boolean;
  created_at?: string;
  updated_at?: string;
  product_media?: ProductMediaRow[] | null;
}

export function coverImageFromMedia(
  media: ProductMediaRow[] | null | undefined,
): string {
  if (!media || media.length === 0) return "";
  const cover = media.find((m) => m.is_cover) ?? media[0];
  return cover?.url ?? "";
}

export function rowToCatalogProduct(row: ProductRow): CatalogProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    price: formatDOPFromCents(row.base_price_cents),
    priceCents: row.base_price_cents,
    coverImage: coverImageFromMedia(row.product_media),
    categorySlug: null,
    sizes: [],
  };
}
