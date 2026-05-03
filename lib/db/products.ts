import type { CatalogProduct } from "@/types";

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  model_path: string;
  cover_image_url: string | null;
  default_design_id: string | null;
  published: boolean;
  sort_order: number;
  /** Join con textures: url de la textura base (objeto o array según Supabase) */
  textures?: { url: string } | { url: string }[] | null;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function textureUrlFromRow(textures: ProductRow["textures"]): string | null {
  if (!textures) return null;
  const t = Array.isArray(textures) ? textures[0] : textures;
  return t?.url ?? null;
}

export function rowToCatalogProduct(row: ProductRow): CatalogProduct {
  const baseTextureUrl = textureUrlFromRow(row.textures);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    price: formatPrice(row.price_cents),
    priceCents: row.price_cents,
    modelPath: row.model_path ?? null,
    coverImage: row.cover_image_url ?? "",
    ...(baseTextureUrl != null && { baseTextureUrl }),
    ...(row.default_design_id && { defaultDesignId: row.default_design_id }),
  };
}
