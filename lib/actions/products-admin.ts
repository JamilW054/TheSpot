"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/server";

export type AdminProductActionState = { ok?: true; error?: string };

function slugify(input: string): string {
  const s = input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (s.slice(0, 96) || "articulo").toLowerCase();
}

function parseTagsFromForm(formData: FormData): string[] {
  const raw = formData.get("tags")?.toString() ?? "";
  const parts = raw.split(/[,;\n]+/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const t = p.trim().toLowerCase().replace(/\s+/g, " ");
    if (!t || t.length > 48) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= 24) break;
  }
  return out;
}

const VALID_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function parseSizesFromForm(formData: FormData): string[] {
  return VALID_SIZES.filter((s) => formData.get(`size_${s}`) === "on");
}

function parseCategoryId(formData: FormData): string | null {
  const v = formData.get("category_id")?.toString().trim() ?? "";
  return v.length > 0 ? v : null;
}

async function pickUniqueProductSlug(
  supabase: ReturnType<typeof createServiceClient>,
  name: string,
  tags: string[],
): Promise<string> {
  const base = slugify(name) || "articulo";
  const tagBits = tags
    .slice(0, 3)
    .map((t) => slugify(t))
    .filter((s) => s.length > 0);
  const primary =
    tagBits.length > 0
      ? `${base}-${tagBits.join("-")}`.replace(/-+/g, "-").slice(0, 96)
      : base.slice(0, 96);

  const trySlug = async (candidate: string) => {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    return data == null;
  };

  if (await trySlug(primary)) return primary;
  for (let n = 2; n <= 200; n++) {
    const c = `${base}-${n}`.slice(0, 96);
    if (await trySlug(c)) return c;
  }
  const fallback =
    `${base}-${randomUUID().replace(/-/g, "").slice(0, 10)}`.slice(0, 96);
  return fallback;
}

async function getDefaultProductModelPath(
  supabase: ReturnType<typeof createServiceClient>,
): Promise<string> {
  const { data, error } = await supabase
    .from("base_models")
    .select("path")
    .order("path", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const path = (data as { path?: string } | null)?.path?.trim();
  if (!path) {
    throw new Error(
      "Falta configuración: añade al menos una fila en la tabla base_models.",
    );
  }
  return path;
}

function parsePriceDopToCents(raw: string): number {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Precio inválido.");
  }
  return Math.round(n * 100);
}

export async function adminCreateProduct(
  _prev: AdminProductActionState | undefined,
  formData: FormData,
): Promise<AdminProductActionState> {
  try {
    await requireAdmin();
    const supabase = createServiceClient();

    const name = formData.get("name")?.toString().trim() ?? "";
    if (!name) throw new Error("El nombre es obligatorio.");

    const tags = parseTagsFromForm(formData);
    const sizes = parseSizesFromForm(formData);
    const category_id = parseCategoryId(formData);
    const slug = await pickUniqueProductSlug(supabase, name, tags);

    const description = formData.get("description")?.toString().trim() || null;
    const model_path = await getDefaultProductModelPath(supabase);

    const price_cents = parsePriceDopToCents(
      formData.get("price_dop")?.toString() ?? "",
    );
    const published = formData.get("published") === "on";
    const sort_order = Math.max(
      0,
      Math.round(Number(formData.get("sort_order")?.toString() || "0")),
    );
    const cover_image_url =
      formData.get("cover_image_url")?.toString().trim() || null;

    const { data: inserted, error: insErr } = await supabase
      .from("products")
      .insert({
        slug,
        name,
        description,
        price_cents,
        model_path,
        cover_image_url,
        published,
        sort_order,
        category_id,
        tags,
        sizes,
        default_design_id: null,
        base_texture_id: null,
      })
      .select("id")
      .single();

    if (insErr) {
      if (insErr.code === "23505") {
        return {
          error: "Conflicto al generar la URL del artículo. Vuelve a intentar.",
        };
      }
      return { error: insErr.message ?? "No se pudo crear el producto." };
    }

    const productId = (inserted as { id: string }).id;

    if (cover_image_url) {
      const { data: tex, error: texErr } = await supabase
        .from("textures")
        .insert({
          source: "buxxep",
          url: cover_image_url,
          product_id: productId,
        })
        .select("id")
        .single();
      if (!texErr && tex) {
        await supabase
          .from("products")
          .update({ base_texture_id: (tex as { id: string }).id })
          .eq("id", productId);
      }
    }

    revalidatePath("/admin/catalogo");
    revalidatePath("/catalogo");
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido.";
    return { error: msg };
  }
}

export async function adminUpdateProduct(
  _prev: AdminProductActionState | undefined,
  formData: FormData,
): Promise<AdminProductActionState> {
  try {
    await requireAdmin();
    const supabase = createServiceClient();
    const id = formData.get("product_id")?.toString().trim();
    if (!id) throw new Error("Producto no válido.");

    const { data: prevRow, error: prevErr } = await supabase
      .from("products")
      .select("slug, cover_image_url, base_texture_id")
      .eq("id", id)
      .single();
    if (prevErr || !prevRow) throw new Error("Producto no encontrado.");

    const prev = prevRow as {
      slug: string;
      cover_image_url: string | null;
      base_texture_id: string | null;
    };

    const name = formData.get("name")?.toString().trim() ?? "";
    if (!name) throw new Error("El nombre es obligatorio.");

    const tags = parseTagsFromForm(formData);
    const sizes = parseSizesFromForm(formData);
    const category_id = parseCategoryId(formData);

    const description = formData.get("description")?.toString().trim() || null;

    const price_cents = parsePriceDopToCents(
      formData.get("price_dop")?.toString() ?? "",
    );
    const published = formData.get("published") === "on";
    const sort_order = Math.max(
      0,
      Math.round(Number(formData.get("sort_order")?.toString() || "0")),
    );
    const cover_image_url =
      formData.get("cover_image_url")?.toString().trim() || null;

    let nextBaseTextureId: string | null | undefined = undefined;

    if (cover_image_url !== prev.cover_image_url) {
      if (!cover_image_url && prev.base_texture_id) {
        await supabase
          .from("products")
          .update({ base_texture_id: null })
          .eq("id", id);
        await supabase.from("textures").delete().eq("id", prev.base_texture_id);
        nextBaseTextureId = null;
      } else if (cover_image_url && prev.base_texture_id) {
        await supabase
          .from("textures")
          .update({ url: cover_image_url })
          .eq("id", prev.base_texture_id);
      } else if (cover_image_url && !prev.base_texture_id) {
        const { data: tex, error: texErr } = await supabase
          .from("textures")
          .insert({
            source: "buxxep",
            url: cover_image_url,
            product_id: id,
          })
          .select("id")
          .single();
        if (!texErr && tex) {
          nextBaseTextureId = (tex as { id: string }).id;
        }
      }
    }

    const patch: Record<string, unknown> = {
      name,
      description,
      price_cents,
      cover_image_url,
      published,
      sort_order,
      category_id,
      tags,
      sizes,
    };
    if (nextBaseTextureId !== undefined) {
      patch.base_texture_id = nextBaseTextureId;
    }

    const { error: updErr } = await supabase
      .from("products")
      .update(patch)
      .eq("id", id);
    if (updErr) {
      return { error: updErr.message ?? "No se pudo actualizar." };
    }

    revalidatePath("/admin/catalogo");
    revalidatePath("/catalogo");
    revalidatePath(`/catalogo/${prev.slug}`);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido.";
    return { error: msg };
  }
}

export async function adminDeleteProduct(productId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { count, error: cErr } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  if (cErr) throw new Error(cErr.message);
  if ((count ?? 0) > 0) {
    throw new Error(
      "No se puede eliminar: hay pedidos que incluyen este producto.",
    );
  }
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/catalogo");
  revalidatePath("/catalogo");
}
