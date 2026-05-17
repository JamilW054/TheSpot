import { createClient, createServiceClient } from "@/lib/supabase/server";

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  /** Miniatura opcional para la rejilla del catálogo (URL pública). */
  image_url?: string | null;
  /** Referencia a la categoría padre — null para categorías raíz. */
  parent_id?: string | null;
  /** Preset de tallas asignado a esta categoría. */
  size_preset_id?: string | null;
}

/** Detecta cualquier error de columna no encontrada en PostgREST (PGRST204). */
function isMissingColumnError(error: {
  message?: string;
  code?: string;
}): boolean {
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    msg.includes("could not find") ||
    msg.includes("schema cache") ||
    (msg.includes("column") && msg.includes("categories"))
  );
}

async function withCatalogFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
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
export async function getCategoryAdminById(
  id: string,
): Promise<CategoryRow | null> {
  const s = id.trim();
  if (!s) return null;
  const supabase = createServiceClient();

  const full = await supabase
    .from("categories")
    .select("id, slug, name, sort_order, parent_id, image_url, size_preset_id")
    .eq("id", s)
    .maybeSingle();

  if (!full.error) return full.data as CategoryRow | null;

  if (isMissingColumnError(full.error)) {
    const base = await supabase
      .from("categories")
      .select("id, slug, name, sort_order, parent_id")
      .eq("id", s)
      .maybeSingle();
    if (base.error) throw new Error(base.error.message);
    return (base.data ?? null) as CategoryRow | null;
  }

  throw new Error(full.error.message);
}

export async function getCategoriesForAdmin(): Promise<CategoryRow[]> {
  const supabase = createServiceClient();

  const full = await supabase
    .from("categories")
    .select("id, slug, name, sort_order, parent_id, image_url, size_preset_id")
    .order("sort_order", { ascending: true });

  if (!full.error) return (full.data ?? []) as CategoryRow[];

  if (isMissingColumnError(full.error)) {
    const base = await supabase
      .from("categories")
      .select("id, slug, name, sort_order, parent_id")
      .order("sort_order", { ascending: true });
    if (base.error) throw new Error(base.error.message);
    return (base.data ?? []) as CategoryRow[];
  }

  throw new Error(full.error.message);
}

/**
 * Catálogo público: única fuente de verdad es Supabase (`public.categories`).
 * Intenta con `image_url` y `parent_id`; si la columna no existe hace fallback
 * progresivo hasta quedarse solo con los campos garantizados.
 */
export async function getCategoriesPublic(): Promise<CategoryRow[]> {
  return withCatalogFallback(async () => {
    const supabase = await createClient();

    // 1st attempt: full columns
    const full = await supabase
      .from("categories")
      .select("id, slug, name, sort_order, parent_id, image_url")
      .order("sort_order", { ascending: true });

    if (!full.error) return (full.data ?? []) as CategoryRow[];

    // 2nd attempt: without image_url (column might not exist yet)
    if (isMissingColumnError(full.error)) {
      const noImg = await supabase
        .from("categories")
        .select("id, slug, name, sort_order, parent_id")
        .order("sort_order", { ascending: true });

      if (!noImg.error) return (noImg.data ?? []) as CategoryRow[];

      // 3rd attempt: minimum guaranteed columns
      if (isMissingColumnError(noImg.error)) {
        const minimal = await supabase
          .from("categories")
          .select("id, slug, name, sort_order")
          .order("sort_order", { ascending: true });
        if (minimal.error) throw new Error(minimal.error.message);
        return (minimal.data ?? []) as CategoryRow[];
      }

      throw new Error(noImg.error.message);
    }

    throw new Error(full.error.message);
  }, []);
}

/**
 * Primera imagen de portada por categoría (producto publicado con menor sort_order).
 */
export async function getCategoryCoverByCategoryId(): Promise<
  Record<string, string>
> {
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
