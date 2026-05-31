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

async function pickUniqueProductSlug(
  supabase: ReturnType<typeof createServiceClient>,
  name: string,
): Promise<string> {
  const base = slugify(name) || "articulo";

  const trySlug = async (candidate: string) => {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    return data == null;
  };

  if (await trySlug(base)) return base;
  for (let n = 2; n <= 200; n++) {
    const c = `${base}-${n}`.slice(0, 96);
    if (await trySlug(c)) return c;
  }
  return `${base}-${randomUUID().replace(/-/g, "").slice(0, 10)}`.slice(0, 96);
}

function parsePriceDopToCents(raw: string): number {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n < 0) throw new Error("Precio inválido.");
  return Math.round(n * 100);
}

function parseOptionalPriceDopToCents(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "0" || trimmed === "0.00") return null;
  return parsePriceDopToCents(trimmed);
}

async function upsertCoverMedia(
  supabase: ReturnType<typeof createServiceClient>,
  productId: string,
  coverUrl: string | null,
  altText: string,
): Promise<void> {
  if (!coverUrl) {
    await supabase
      .from("product_media")
      .delete()
      .eq("product_id", productId)
      .eq("is_cover", true);
    return;
  }

  const { data: existing } = await supabase
    .from("product_media")
    .select("id")
    .eq("product_id", productId)
    .eq("is_cover", true)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("product_media")
      .update({ url: coverUrl, alt_text: altText })
      .eq("id", (existing as { id: string }).id);
  } else {
    await supabase.from("product_media").insert({
      product_id: productId,
      url: coverUrl,
      media_type: "img",
      alt_text: altText,
      sort_order: 0,
      is_cover: true,
    });
  }
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

    const slug = await pickUniqueProductSlug(supabase, name);
    const description = formData.get("description")?.toString().trim() || null;

    const base_price_cents = parsePriceDopToCents(
      formData.get("base_price_dop")?.toString() ?? "",
    );
    const original_price_cents = parseOptionalPriceDopToCents(
      formData.get("original_price_dop")?.toString() ?? "",
    );

    const is_active = formData.get("is_active") === "on";
    const is_customizable = formData.get("is_customizable") === "on";
    const cover_url = formData.get("cover_image_url")?.toString().trim() || null;

    const { data: inserted, error: insErr } = await supabase
      .from("products")
      .insert({
        slug,
        name,
        description,
        base_price_cents,
        original_price_cents,
        is_active,
        is_customizable,
      })
      .select("id")
      .single();

    if (insErr) {
      if (insErr.code === "23505") {
        return { error: "Conflicto al generar la URL. Vuelve a intentar." };
      }
      return { error: insErr.message ?? "No se pudo crear el producto." };
    }

    const productId = (inserted as { id: string }).id;

    if (cover_url) {
      await upsertCoverMedia(supabase, productId, cover_url, name);
    }

    revalidatePath("/admin/catalogo");
    revalidatePath("/catalogo");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error desconocido." };
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
      .select("slug")
      .eq("id", id)
      .single();
    if (prevErr || !prevRow) throw new Error("Producto no encontrado.");
    const prevSlug = (prevRow as { slug: string }).slug;

    const name = formData.get("name")?.toString().trim() ?? "";
    if (!name) throw new Error("El nombre es obligatorio.");

    const description = formData.get("description")?.toString().trim() || null;
    const base_price_cents = parsePriceDopToCents(
      formData.get("base_price_dop")?.toString() ?? "",
    );
    const original_price_cents = parseOptionalPriceDopToCents(
      formData.get("original_price_dop")?.toString() ?? "",
    );
    const is_active = formData.get("is_active") === "on";
    const is_customizable = formData.get("is_customizable") === "on";
    const cover_url = formData.get("cover_image_url")?.toString().trim() || null;

    const { error: updErr } = await supabase
      .from("products")
      .update({
        name,
        description,
        base_price_cents,
        original_price_cents,
        is_active,
        is_customizable,
      })
      .eq("id", id);

    if (updErr) {
      return { error: updErr.message ?? "No se pudo actualizar." };
    }

    await upsertCoverMedia(supabase, id, cover_url, name);

    revalidatePath("/admin/catalogo");
    revalidatePath("/catalogo");
    revalidatePath(`/catalogo/${prevSlug}`);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error desconocido." };
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
