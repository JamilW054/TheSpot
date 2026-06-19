"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/server";
import { variantKey } from "@/lib/variants";

export type AdminProductActionState = { ok?: true; error?: string };

type ServiceClient = ReturnType<typeof createServiceClient>;

/** Variante enviada desde el formulario (JSON). */
interface VariantInput {
  /** Talla; vacío si el producto no varía por talla. */
  size: string;
  /** Color; vacío si el producto no varía por color. */
  color?: string;
  /** Hex del color (para el swatch); solo si hay color. */
  hex?: string;
  sku?: string;
  /** Precio en DOP; si vacío, hereda el precio base. */
  priceDop?: string;
  /** Existencias en el almacén por defecto. */
  qty?: number;
  active?: boolean;
}

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

function parseCategoryId(formData: FormData): string | null {
  const v = formData.get("category_id")?.toString().trim() ?? "";
  return v.length > 0 ? v : null;
}

function parsePriceDopToCents(raw: string): number {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Precio inválido.");
  }
  return Math.round(n * 100);
}

function parseOptionalPriceCents(raw: string | undefined): number | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  return parsePriceDopToCents(t);
}

function parseVariants(formData: FormData): VariantInput[] {
  const raw = formData.get("variants_json")?.toString() ?? "[]";
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const out: VariantInput[] = [];
  const seen = new Set<string>();
  for (const v of parsed) {
    if (typeof v !== "object" || v == null) continue;
    const rec = v as Record<string, unknown>;
    const size = typeof rec.size === "string" ? rec.size.trim() : "";
    const color = typeof rec.color === "string" ? rec.color.trim() : "";
    const key = variantKey(size, color);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      size,
      color: color || undefined,
      hex:
        color && typeof rec.hex === "string" ? rec.hex.trim() : undefined,
      sku: typeof rec.sku === "string" ? rec.sku.trim() : undefined,
      priceDop: typeof rec.priceDop === "string" ? rec.priceDop : undefined,
      qty: Number.isFinite(Number(rec.qty))
        ? Math.max(0, Math.round(Number(rec.qty)))
        : 0,
      active: rec.active !== false,
    });
  }
  return out;
}

async function pickUniqueProductSlug(
  supabase: ServiceClient,
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

/** Almacén por defecto para registrar inventario; crea "Principal" si no existe. */
async function getDefaultWarehouseId(supabase: ServiceClient): Promise<string> {
  const { data } = await supabase
    .from("warehouses")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const existing = (data as { id?: string } | null)?.id;
  if (existing) return existing;
  const { data: created, error } = await supabase
    .from("warehouses")
    .insert({ name: "Principal", country_code: "DO", is_active: true })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return (created as { id: string }).id;
}

/** Garantiza que existan las etiquetas y devuelve sus ids por slug. */
async function ensureTags(
  supabase: ServiceClient,
  slugs: string[],
): Promise<string[]> {
  if (slugs.length === 0) return [];
  await supabase.from("tags").upsert(
    slugs.map((slug) => ({ slug, name: slug })),
    { onConflict: "slug", ignoreDuplicates: true },
  );
  const { data } = await supabase
    .from("tags")
    .select("id, slug")
    .in("slug", slugs);
  return (data ?? []).map((t: { id: string }) => t.id);
}

async function syncProductTags(
  supabase: ServiceClient,
  productId: string,
  tagSlugs: string[],
): Promise<void> {
  const tagIds = await ensureTags(supabase, tagSlugs);
  await supabase.from("product_tags").delete().eq("product_id", productId);
  if (tagIds.length === 0) return;
  await supabase
    .from("product_tags")
    .insert(tagIds.map((tag_id) => ({ product_id: productId, tag_id })));
}

/**
 * Reemplaza la galería de imágenes (product_media) del producto. La primera
 * imagen de la lista se marca como portada (is_cover).
 */
async function syncProductMedia(
  supabase: ServiceClient,
  productId: string,
  urls: string[],
): Promise<void> {
  await supabase.from("product_media").delete().eq("product_id", productId);
  const clean = urls.map((u) => u.trim()).filter(Boolean);
  if (clean.length === 0) return;
  await supabase.from("product_media").insert(
    clean.map((url, i) => ({
      product_id: productId,
      url,
      media_type: "image",
      is_cover: i === 0,
      sort_order: i,
    })),
  );
}

/** Lee la galería de imágenes desde el campo JSON `media_json`. */
function parseMediaUrls(formData: FormData): string[] {
  const raw = formData.get("media_json")?.toString() ?? "[]";
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((u): u is string => typeof u === "string");
  } catch {
    return [];
  }
}

/**
 * Reconcilia variantes por talla: actualiza las existentes, crea las nuevas y
 * desactiva (soft) las que ya no se envían — preserva historial de pedidos/carrito.
 */
async function syncVariants(
  supabase: ServiceClient,
  productId: string,
  productSlug: string,
  basePriceCents: number,
  variants: VariantInput[],
  explicitWarehouseId?: string | null,
): Promise<void> {
  const { data: existingData } = await supabase
    .from("product_variants")
    .select("id, attributes, is_active")
    .eq("product_id", productId);
  const existing = (existingData ?? []) as {
    id: string;
    attributes: Record<string, unknown> | null;
    is_active: boolean;
  }[];

  const keyOfAttrs = (attrs: Record<string, unknown> | null) => {
    const size = typeof attrs?.size === "string" ? (attrs.size as string) : "";
    const color =
      typeof attrs?.color === "string" ? (attrs.color as string) : "";
    return variantKey(size, color);
  };
  const byKey = new Map(existing.map((v) => [keyOfAttrs(v.attributes), v]));

  const warehouseId =
    explicitWarehouseId?.trim() || (await getDefaultWarehouseId(supabase));
  const submittedKeys = new Set(
    variants.map((v) => variantKey(v.size, v.color)),
  );

  let sort = 0;
  for (const v of variants) {
    const key = variantKey(v.size, v.color);
    const priceCents = parseOptionalPriceCents(v.priceDop) ?? basePriceCents;
    const attributes: Record<string, string> = {};
    if (v.size) attributes.size = v.size;
    if (v.color) {
      attributes.color = v.color;
      if (v.hex) attributes.hex = v.hex;
    }
    const skuSuffix = [v.size, v.color].filter(Boolean).join("-") || "u";
    const sku =
      v.sku && v.sku.length > 0
        ? v.sku
        : `${productSlug}-${skuSuffix}`
            .toUpperCase()
            .replace(/[^A-Z0-9-]/g, "");
    const match = byKey.get(key);

    let variantId: string;
    if (match) {
      variantId = match.id;
      await supabase
        .from("product_variants")
        .update({
          sku,
          price_cents: priceCents,
          attributes,
          is_active: v.active !== false,
          sort_order: sort,
        })
        .eq("id", variantId);
    } else {
      const { data: created, error } = await supabase
        .from("product_variants")
        .insert({
          product_id: productId,
          sku,
          price_cents: priceCents,
          attributes,
          is_active: v.active !== false,
          sort_order: sort,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      variantId = (created as { id: string }).id;
    }

    await supabase.from("inventory").upsert(
      {
        variant_id: variantId,
        warehouse_id: warehouseId,
        quantity: v.qty ?? 0,
      },
      { onConflict: "variant_id,warehouse_id" },
    );
    sort++;
  }

  // Desactiva variantes cuya combinación (talla/color) ya no se envía.
  for (const v of existing) {
    if (!submittedKeys.has(keyOfAttrs(v.attributes)) && v.is_active) {
      await supabase
        .from("product_variants")
        .update({ is_active: false })
        .eq("id", v.id);
    }
  }
}

function readProductFields(formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  if (!name) throw new Error("El nombre es obligatorio.");
  return {
    name,
    description: formData.get("description")?.toString().trim() || null,
    category_id: parseCategoryId(formData),
    brand_id: formData.get("brand_id")?.toString().trim() || null,
    linea_id: formData.get("linea_id")?.toString().trim() || null,
    tags: parseTagsFromForm(formData),
    base_price_cents: parsePriceDopToCents(
      formData.get("price_dop")?.toString() ?? "",
    ),
    original_price_cents: parseOptionalPriceCents(
      formData.get("original_price_dop")?.toString(),
    ),
    is_active: formData.get("published") === "on",
    is_customizable: formData.get("is_customizable") === "on",
    warehouse_id: formData.get("warehouse_id")?.toString().trim() || null,
    media: parseMediaUrls(formData),
    variants: parseVariants(formData),
  };
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
    const f = readProductFields(formData);
    const slug = await pickUniqueProductSlug(supabase, f.name);

    const { data: inserted, error: insErr } = await supabase
      .from("products")
      .insert({
        slug,
        name: f.name,
        description: f.description,
        category_id: f.category_id,
        brand_id: f.brand_id,
        linea_id: f.linea_id,
        base_price_cents: f.base_price_cents,
        original_price_cents: f.original_price_cents,
        is_active: f.is_active,
        is_customizable: f.is_customizable,
      })
      .select("id, slug")
      .single();

    if (insErr) {
      if (insErr.code === "23505") {
        return { error: "Conflicto al generar la URL. Vuelve a intentar." };
      }
      return { error: insErr.message ?? "No se pudo crear el producto." };
    }

    const product = inserted as { id: string; slug: string };
    await syncProductMedia(supabase, product.id, f.media);
    await syncProductTags(supabase, product.id, f.tags);
    await syncVariants(
      supabase,
      product.id,
      product.slug,
      f.base_price_cents,
      f.variants,
      f.warehouse_id,
    );

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
    const prev = prevRow as { slug: string };

    const f = readProductFields(formData);

    const { error: updErr } = await supabase
      .from("products")
      .update({
        name: f.name,
        description: f.description,
        category_id: f.category_id,
        brand_id: f.brand_id,
        linea_id: f.linea_id,
        base_price_cents: f.base_price_cents,
        original_price_cents: f.original_price_cents,
        is_active: f.is_active,
        is_customizable: f.is_customizable,
      })
      .eq("id", id);
    if (updErr) return { error: updErr.message ?? "No se pudo actualizar." };

    await syncProductMedia(supabase, id, f.media);
    await syncProductTags(supabase, id, f.tags);
    await syncVariants(supabase, id, prev.slug, f.base_price_cents, f.variants, f.warehouse_id);

    revalidatePath("/admin/catalogo");
    revalidatePath("/catalogo");
    revalidatePath(`/catalogo/${prev.slug}`);
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

export async function adminDeleteProduct(productId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();

  // Bloquea el borrado si alguna variante aparece en pedidos.
  const { data: variants } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);
  const variantIds = (variants ?? []).map((v: { id: string }) => v.id);
  if (variantIds.length > 0) {
    const { count, error: cErr } = await supabase
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .in("variant_id", variantIds);
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) > 0) {
      throw new Error(
        "No se puede eliminar: hay pedidos que incluyen este producto.",
      );
    }
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/catalogo");
  revalidatePath("/catalogo");
}
