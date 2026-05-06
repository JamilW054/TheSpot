import { createClient, createServiceClient } from "@/lib/supabase/server";

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
}

async function withCatalogFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getCategoriesForAdmin(): Promise<CategoryRow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as CategoryRow[];
}

/** Categorías públicas para la tienda (orden configurado en admin). */
export async function getCategoriesPublic(): Promise<CategoryRow[]> {
  return withCatalogFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as CategoryRow[];
  }, []);
}

/**
 * Primera imagen de portada por categoría (producto publicado con menor sort_order).
 */
export async function getCategoryCoverByCategoryId(): Promise<Record<string, string>> {
  return withCatalogFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("category_id, cover_image_url, sort_order")
      .eq("published", true)
      .not("category_id", "is", null)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    const map: Record<string, string> = {};
    for (const row of data ?? []) {
      const r = row as {
        category_id: string;
        cover_image_url: string | null;
      };
      const url = r.cover_image_url?.trim();
      if (url && map[r.category_id] === undefined) map[r.category_id] = url;
    }
    return map;
  }, {});
}
