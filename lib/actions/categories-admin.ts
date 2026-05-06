"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { slugify } from "@/lib/slug";
import { createServiceClient } from "@/lib/supabase/server";

export type AdminCategoryActionState = { ok?: true; error?: string };

function normalizeSlug(raw: string, fallbackName: string): string {
  const t = raw.trim();
  if (t.length > 0)
    return (
      slugify(t, { maxLength: 96 }) ||
      slugify(fallbackName, { maxLength: 96 }) ||
      "categoria"
    );
  return slugify(fallbackName, { maxLength: 96 }) || "categoria";
}

async function pickUniqueCategorySlug(
  supabase: ReturnType<typeof createServiceClient>,
  desired: string,
  excludeId?: string,
): Promise<string> {
  const base = desired.slice(0, 96) || "categoria";
  const slugTaken = async (s: string) => {
    const { data } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", s)
      .maybeSingle();
    if (!data) return false;
    if (excludeId && data.id === excludeId) return false;
    return true;
  };
  if (!(await slugTaken(base))) return base;
  for (let n = 2; n <= 500; n++) {
    const c = `${base}-${n}`.slice(0, 96);
    if (!(await slugTaken(c))) return c;
  }
  return `${base}-x`.slice(0, 96);
}

function parseSortOrder(formData: FormData): number {
  const raw = formData.get("sort_order")?.toString().trim() ?? "0";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

const MAX_IMAGE_URL_LEN = 2048;

/** Vacío → null; si no, URL http(s) absoluta. */
function normalizeCategoryImageUrl(raw: unknown): string | null {
  const t = typeof raw === "string" ? raw.trim() : "";
  if (!t) return null;
  if (t.length > MAX_IMAGE_URL_LEN) {
    throw new Error(`La URL supera ${MAX_IMAGE_URL_LEN} caracteres.`);
  }
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    throw new Error(
      "URL de imagen no válida (usa una dirección http o https completa).",
    );
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("La imagen debe usar http o https.");
  }
  return u.href;
}

function revalidateCatalogPaths() {
  revalidatePath("/catalogo");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/catalogo");
}

export async function adminCreateCategory(
  _prev: AdminCategoryActionState | undefined,
  formData: FormData,
): Promise<AdminCategoryActionState> {
  try {
    await requireAdmin();
    const supabase = createServiceClient();

    const name = formData.get("name")?.toString().trim() ?? "";
    if (!name) throw new Error("El nombre es obligatorio.");

    const slugRaw = formData.get("slug")?.toString() ?? "";
    const baseSlug = normalizeSlug(slugRaw, name);
    const slug = await pickUniqueCategorySlug(supabase, baseSlug);

    const sort_order = parseSortOrder(formData);
    const image_url = normalizeCategoryImageUrl(formData.get("image_url"));

    const { error } = await supabase.from("categories").insert({
      slug,
      name,
      sort_order,
      image_url,
      parent_id: null,
    });
    if (error) throw new Error(error.message);

    revalidateCatalogPaths();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear." };
  }
}

export async function adminUpdateCategory(
  _prev: AdminCategoryActionState | undefined,
  formData: FormData,
): Promise<AdminCategoryActionState> {
  try {
    await requireAdmin();
    const supabase = createServiceClient();

    const id = formData.get("category_id")?.toString().trim() ?? "";
    if (!id) throw new Error("Falta el identificador de categoría.");

    const name = formData.get("name")?.toString().trim() ?? "";
    if (!name) throw new Error("El nombre es obligatorio.");

    const slugRaw = formData.get("slug")?.toString() ?? "";
    const baseSlug = normalizeSlug(slugRaw, name);
    const slug = await pickUniqueCategorySlug(supabase, baseSlug, id);

    const sort_order = parseSortOrder(formData);
    const image_url = normalizeCategoryImageUrl(formData.get("image_url"));

    const { error } = await supabase
      .from("categories")
      .update({
        slug,
        name,
        sort_order,
        image_url,
      })
      .eq("id", id);
    if (error) throw new Error(error.message);

    revalidateCatalogPaths();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }
}

export async function adminDeleteCategory(categoryId: string): Promise<void> {
  await requireAdmin();
  const id = categoryId.trim();
  if (!id) throw new Error("Id inválido.");

  const supabase = createServiceClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateCatalogPaths();
}
