import { createClient, createServiceClient } from "@/lib/supabase/server";

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  /** Miniatura opcional para la rejilla del catálogo (URL pública). */
  image_url?: string | null;
}

function isLikelyMissingImageUrlColumn(error: {
  message?: string;
  code?: string;
}): boolean {
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    (msg.includes("image_url") &&
      (msg.includes("column") ||
        msg.includes("schema cache") ||
        msg.includes("could not find")))
  );
}

async function withCatalogFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[catalog] Supabase query fell back to empty:", e);
    }
    return fallback;
  }
}

/** Una categoría por id (admin / service). */
export async function getCategoryAdminById(id: string): Promise<CategoryRow | null> {
  const s = id.trim();
  if (!s) return null;
  const supabase = createServiceClient();
  const full = await supabase
    .from("categories")
    .select("id, slug, name, sort_order, image_url")
    .eq("id", s)
    .maybeSingle();
  let error = full.error;
  let row = full.data as CategoryRow | null;
  if (error && isLikelyMissingImageUrlColumn(error)) {
    const base = await supabase
      .from("categories")
      .select("id, slug, name, sort_order")
      .eq("id", s)
      .maybeSingle();
    error = base.error;
    row = (base.data ?? null) as CategoryRow | null;
  }
  if (error) throw new Error(error.message);
  return row;
}

export async function getCategoriesForAdmin(): Promise<CategoryRow[]> {
  const supabase = createServiceClient();
  const full = await supabase
    .from("categories")
    .select("id, slug, name, sort_order, image_url")
    .order("sort_order", { ascending: true });
  let error = full.error;
  let rows = (full.data ?? []) as CategoryRow[];
  if (error && isLikelyMissingImageUrlColumn(error)) {
    const base = await supabase
      .from("categories")
      .select("id, slug, name, sort_order")
      .order("sort_order", { ascending: true });
    error = base.error;
    rows = (base.data ?? []) as CategoryRow[];
  }
  if (error) throw new Error(error.message);
  return rows;
}

/**
 * Catálogo público: única fuente de verdad es Supabase (`public.categories`).
 * Cliente anon + RLS; miniatura opcional en `image_url`, fallback de imagen vía productos en la UI.
 */
export async function getCategoriesPublic(): Promise<CategoryRow[]> {
  return withCatalogFallback(async () => {
    const supabase = await createClient();
    const full = await supabase
      .from("categories")
      .select("id, slug, name, sort_order, image_url")
      .order("sort_order", { ascending: true });
    let error = full.error;
    let rows = (full.data ?? []) as CategoryRow[];
    if (error && isLikelyMissingImageUrlColumn(error)) {
      const base = await supabase
        .from("categories")
        .select("id, slug, name, sort_order")
        .order("sort_order", { ascending: true });
      error = base.error;
      rows = (base.data ?? []) as CategoryRow[];
    }
    if (error) throw new Error(error.message);
    return rows;
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
