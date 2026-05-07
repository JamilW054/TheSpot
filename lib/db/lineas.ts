import type { Linea } from "@/types";

export interface LineaRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  gallery: unknown;
  published: boolean;
  sort_order: number;
}

export interface ProductLineaRow {
  product_id: string;
  linea_id: string;
}

export function rowToLinea(
  row: LineaRow,
  productCount: number,
  productNames?: string[],
): Linea {
  const gallery = Array.isArray(row.gallery) ? (row.gallery as string[]) : [];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    items: productCount,
    published: row.published,
    coverImage: row.cover_image_url ?? "",
    gallery,
    ...(productNames && productNames.length > 0 && { products: productNames }),
  };
}
