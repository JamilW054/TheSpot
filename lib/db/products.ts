import type { CatalogProduct } from "@/types";
import { formatDOPFromCents } from "@/lib/format-currency";

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  model_path: string;
  cover_image_url: string | null;
  base_texture_id?: string | null;
  default_design_id: string | null;
  published: boolean;
  sort_order: number;
  category_id?: string | null;
  /** Etiquetas en minúsculas (columna `tags` en DB). */
  tags?: string[] | null;
  /** Join con textures: url de la textura base (objeto o array según Supabase) */
  textures?: { url: string } | { url: string }[] | null;
  /** Join opcional con categories (PostgREST puede devolver objeto o array de un elemento). */
  categories?: { slug: string } | { slug: string }[] | null;
}

function categorySlugFromRow(
  categories: ProductRow["categories"],
): string | null {
  if (!categories) return null;
  const c = Array.isArray(categories) ? categories[0] : categories;
  return c?.slug ?? null;
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
    price: formatDOPFromCents(row.price_cents),
    priceCents: row.price_cents,
    modelPath: row.model_path ?? null,
    coverImage: row.cover_image_url ?? "",
    ...(baseTextureUrl != null && { baseTextureUrl }),
    categorySlug: categorySlugFromRow(row.categories),
  };
}
