"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  bannersRepo,
  brandsRepo,
  couponsRepo,
  flashSaleItemsRepo,
  flashSalesRepo,
  lineasAdminRepo,
  notificationsRepo,
  shippingMethodsRepo,
  subcategoriesRepo,
  warehousesRepo,
} from "@/lib/db/repositories";
import type { Repository } from "@/lib/db/repository";
import { slugify } from "@/lib/slug";
import { createServiceClient } from "@/lib/supabase/server";

export type CrudState = { ok?: true; error?: string };

// ---------------------------------------------------------------------------
// Helpers de parseo de FormData
// ---------------------------------------------------------------------------

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key)?.toString().trim();
  return v && v.length > 0 ? v : null;
}

function requiredStr(fd: FormData, key: string, label: string): string {
  const v = str(fd, key);
  if (!v) throw new Error(`${label} es obligatorio.`);
  return v;
}

function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on" || fd.get(key) === "true";
}

function intOrNull(fd: FormData, key: string): number | null {
  const v = fd.get(key)?.toString().trim();
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

function intOr(fd: FormData, key: string, fallback: number): number {
  return intOrNull(fd, key) ?? fallback;
}

function moneyToCents(fd: FormData, key: string): number | null {
  const raw = fd.get(key)?.toString().trim();
  if (!raw) return null;
  const n = Number.parseFloat(raw.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n < 0) throw new Error("Importe inválido.");
  return Math.round(n * 100);
}

function dateTime(fd: FormData, key: string): string | null {
  const v = fd.get(key)?.toString().trim();
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Slug único en una tabla con columna `slug`. */
async function uniqueSlug(
  repo: Repository<{ id: string }>,
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base, { maxLength: 96 }) || "item";
  const taken = async (s: string) => {
    const row = (await repo.findOne({ slug: s })) as { id: string } | null;
    return row != null && row.id !== excludeId;
  };
  if (!(await taken(root))) return root;
  for (let n = 2; n <= 500; n++) {
    const c = `${root}-${n}`.slice(0, 96);
    if (!(await taken(c))) return c;
  }
  return `${root}-${Date.now()}`.slice(0, 96);
}

function ok(): CrudState {
  return { ok: true };
}
function fail(e: unknown): CrudState {
  return { error: e instanceof Error ? e.message : "Error inesperado." };
}

// ===========================================================================
// MARCAS (brands)
// ===========================================================================

export async function adminCreateBrand(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const name = requiredStr(fd, "name", "El nombre");
    await brandsRepo.insert({
      name,
      slug: await uniqueSlug(brandsRepo, str(fd, "slug") ?? name),
      logo_url: str(fd, "logo_url"),
      website_url: str(fd, "website_url"),
      is_active: bool(fd, "is_active"),
    });
    revalidatePath("/admin/marcas");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminUpdateBrand(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const id = requiredStr(fd, "brand_id", "El identificador");
    const name = requiredStr(fd, "name", "El nombre");
    await brandsRepo.updateById(id, {
      name,
      slug: await uniqueSlug(brandsRepo, str(fd, "slug") ?? name, id),
      logo_url: str(fd, "logo_url"),
      website_url: str(fd, "website_url"),
      is_active: bool(fd, "is_active"),
    });
    revalidatePath("/admin/marcas");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminDeleteBrand(id: string): Promise<void> {
  await requireAdmin();
  await brandsRepo.remove(id);
  revalidatePath("/admin/marcas");
}

// ===========================================================================
// CUPONES (coupons)
// ===========================================================================

export async function adminCreateCoupon(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const code = requiredStr(fd, "code", "El código").toUpperCase();
    if (await couponsRepo.exists({ code }))
      throw new Error("Ya existe un cupón con ese código.");
    await couponsRepo.insert({
      code,
      description: str(fd, "description"),
      discount_type: str(fd, "discount_type") ?? "percent",
      discount_value: intOr(fd, "discount_value", 0),
      min_order_cents: moneyToCents(fd, "min_order_dop"),
      max_uses: intOrNull(fd, "max_uses"),
      max_uses_per_user: intOrNull(fd, "max_uses_per_user"),
      is_active: bool(fd, "is_active"),
      starts_at: dateTime(fd, "starts_at"),
      expires_at: dateTime(fd, "expires_at"),
    });
    revalidatePath("/admin/cupones");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminUpdateCoupon(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const id = requiredStr(fd, "coupon_id", "El identificador");
    const code = requiredStr(fd, "code", "El código").toUpperCase();
    await couponsRepo.updateById(id, {
      code,
      description: str(fd, "description"),
      discount_type: str(fd, "discount_type") ?? "percent",
      discount_value: intOr(fd, "discount_value", 0),
      min_order_cents: moneyToCents(fd, "min_order_dop"),
      max_uses: intOrNull(fd, "max_uses"),
      max_uses_per_user: intOrNull(fd, "max_uses_per_user"),
      is_active: bool(fd, "is_active"),
      starts_at: dateTime(fd, "starts_at"),
      expires_at: dateTime(fd, "expires_at"),
    });
    revalidatePath("/admin/cupones");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminDeleteCoupon(id: string): Promise<void> {
  await requireAdmin();
  await couponsRepo.remove(id);
  revalidatePath("/admin/cupones");
}

// ===========================================================================
// ENVÍOS (shipping_methods)
// ===========================================================================

export async function adminCreateShippingMethod(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    await shippingMethodsRepo.insert({
      name: requiredStr(fd, "name", "El nombre"),
      description: str(fd, "description"),
      price_cents: moneyToCents(fd, "price_dop") ?? 0,
      min_days: intOrNull(fd, "min_days"),
      max_days: intOrNull(fd, "max_days"),
      country_code: str(fd, "country_code"),
      is_active: bool(fd, "is_active"),
    });
    revalidatePath("/admin/envios");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminUpdateShippingMethod(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const id = requiredStr(fd, "shipping_method_id", "El identificador");
    await shippingMethodsRepo.updateById(id, {
      name: requiredStr(fd, "name", "El nombre"),
      description: str(fd, "description"),
      price_cents: moneyToCents(fd, "price_dop") ?? 0,
      min_days: intOrNull(fd, "min_days"),
      max_days: intOrNull(fd, "max_days"),
      country_code: str(fd, "country_code"),
      is_active: bool(fd, "is_active"),
    });
    revalidatePath("/admin/envios");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminDeleteShippingMethod(id: string): Promise<void> {
  await requireAdmin();
  await shippingMethodsRepo.remove(id);
  revalidatePath("/admin/envios");
}

// ===========================================================================
// BANNERS
// ===========================================================================

export async function adminCreateBanner(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    await bannersRepo.insert({
      title: requiredStr(fd, "title", "El título"),
      subtitle: str(fd, "subtitle"),
      eyebrow: str(fd, "eyebrow"),
      image_url: str(fd, "image_url"),
      accent_color: str(fd, "accent_color"),
      link_path: str(fd, "link_path"),
      sort_order: intOr(fd, "sort_order", 0),
      is_active: bool(fd, "is_active"),
      starts_at: dateTime(fd, "starts_at"),
      expires_at: dateTime(fd, "expires_at"),
    });
    revalidatePath("/admin/banners");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminUpdateBanner(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const id = requiredStr(fd, "banner_id", "El identificador");
    await bannersRepo.updateById(id, {
      title: requiredStr(fd, "title", "El título"),
      subtitle: str(fd, "subtitle"),
      eyebrow: str(fd, "eyebrow"),
      image_url: str(fd, "image_url"),
      accent_color: str(fd, "accent_color"),
      link_path: str(fd, "link_path"),
      sort_order: intOr(fd, "sort_order", 0),
      is_active: bool(fd, "is_active"),
      starts_at: dateTime(fd, "starts_at"),
      expires_at: dateTime(fd, "expires_at"),
    });
    revalidatePath("/admin/banners");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminDeleteBanner(id: string): Promise<void> {
  await requireAdmin();
  await bannersRepo.remove(id);
  revalidatePath("/admin/banners");
}

// ===========================================================================
// SUBCATEGORÍAS (subcategories)
// ===========================================================================

export async function adminCreateSubcategory(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const name = requiredStr(fd, "name", "El nombre");
    await subcategoriesRepo.insert({
      name,
      slug: await uniqueSlug(subcategoriesRepo, str(fd, "slug") ?? name),
      category_id: requiredStr(fd, "category_id", "La categoría"),
      sort_order: intOr(fd, "sort_order", 0),
      image_url: str(fd, "image_url"),
      size_preset_id: str(fd, "size_preset_id"),
      is_active: bool(fd, "is_active"),
    });
    revalidatePath("/admin/subcategorias");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminUpdateSubcategory(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const id = requiredStr(fd, "subcategory_id", "El identificador");
    const name = requiredStr(fd, "name", "El nombre");
    await subcategoriesRepo.updateById(id, {
      name,
      slug: await uniqueSlug(subcategoriesRepo, str(fd, "slug") ?? name, id),
      category_id: requiredStr(fd, "category_id", "La categoría"),
      sort_order: intOr(fd, "sort_order", 0),
      image_url: str(fd, "image_url"),
      size_preset_id: str(fd, "size_preset_id"),
      is_active: bool(fd, "is_active"),
    });
    revalidatePath("/admin/subcategorias");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminDeleteSubcategory(id: string): Promise<void> {
  await requireAdmin();
  await subcategoriesRepo.remove(id);
  revalidatePath("/admin/subcategorias");
}

// ===========================================================================
// ALMACENES (warehouses)
// ===========================================================================

export async function adminCreateWarehouse(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    await warehousesRepo.insert({
      name: requiredStr(fd, "name", "El nombre"),
      address: str(fd, "address"),
      city: str(fd, "city"),
      country_code: str(fd, "country_code") ?? "DO",
      is_active: bool(fd, "is_active"),
    });
    revalidatePath("/admin/almacenes");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminUpdateWarehouse(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const id = requiredStr(fd, "warehouse_id", "El identificador");
    await warehousesRepo.updateById(id, {
      name: requiredStr(fd, "name", "El nombre"),
      address: str(fd, "address"),
      city: str(fd, "city"),
      country_code: str(fd, "country_code") ?? "DO",
      is_active: bool(fd, "is_active"),
    });
    revalidatePath("/admin/almacenes");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminDeleteWarehouse(id: string): Promise<void> {
  await requireAdmin();
  await warehousesRepo.remove(id);
  revalidatePath("/admin/almacenes");
}

// ===========================================================================
// NOTIFICACIONES (notifications) — solo difusión y borrado
// ===========================================================================

export async function adminCreateNotification(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    const admin = await requireAdmin();
    const targetMode = fd.get("target_mode")?.toString();
    let target = "broadcast";
    if (targetMode === "user") {
      const userId = str(fd, "target_user_id");
      if (!userId) throw new Error("Selecciona un usuario destinatario.");
      target = userId;
    }
    await notificationsRepo.insert({
      title: requiredStr(fd, "title", "El título"),
      body: requiredStr(fd, "body", "El cuerpo"),
      type: str(fd, "type") ?? "system",
      target,
      link_path: str(fd, "link_path"),
      created_by: admin.userId,
    });
    revalidatePath("/admin/notificaciones");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminDeleteNotification(id: string): Promise<void> {
  await requireAdmin();
  await notificationsRepo.remove(id);
  revalidatePath("/admin/notificaciones");
}

// ===========================================================================
// FLASH SALES (flash_sales + flash_sale_items)
// ===========================================================================

/** Sincroniza los productos de una flash sale (reemplaza el set completo). */
async function syncFlashSaleProducts(
  flashSaleId: string,
  productIds: string[],
): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("flash_sale_items")
    .delete()
    .eq("flash_sale_id", flashSaleId);
  const unique = Array.from(new Set(productIds.filter(Boolean)));
  if (unique.length === 0) return;
  await flashSaleItemsRepo.insertMany(
    unique.map((product_id, i) => ({
      flash_sale_id: flashSaleId,
      product_id,
      sort_order: i,
    })),
  );
}

export async function adminCreateFlashSale(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const starts = dateTime(fd, "starts_at");
    const ends = dateTime(fd, "ends_at");
    if (!starts || !ends)
      throw new Error("Las fechas de inicio y fin son obligatorias.");
    const created = await flashSalesRepo.insert({
      name: requiredStr(fd, "name", "El nombre"),
      discount_percent: intOr(fd, "discount_percent", 0),
      is_active: bool(fd, "is_active"),
      starts_at: starts,
      ends_at: ends,
    });
    await syncFlashSaleProducts(
      created.id,
      fd.getAll("product_ids").map(String),
    );
    revalidatePath("/admin/flash-sales");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminUpdateFlashSale(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const id = requiredStr(fd, "flash_sale_id", "El identificador");
    const starts = dateTime(fd, "starts_at");
    const ends = dateTime(fd, "ends_at");
    if (!starts || !ends)
      throw new Error("Las fechas de inicio y fin son obligatorias.");
    await flashSalesRepo.updateById(id, {
      name: requiredStr(fd, "name", "El nombre"),
      discount_percent: intOr(fd, "discount_percent", 0),
      is_active: bool(fd, "is_active"),
      starts_at: starts,
      ends_at: ends,
    });
    await syncFlashSaleProducts(id, fd.getAll("product_ids").map(String));
    revalidatePath("/admin/flash-sales");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminDeleteFlashSale(id: string): Promise<void> {
  await requireAdmin();
  await flashSalesRepo.remove(id);
  revalidatePath("/admin/flash-sales");
}

// ===========================================================================
// LÍNEAS DE ROPA
// ===========================================================================

export async function adminCreateLinea(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const name = requiredStr(fd, "name", "El nombre");
    await lineasAdminRepo.insert({
      name,
      slug: await uniqueSlug(lineasAdminRepo as Repository<{ id: string }>, str(fd, "slug") ?? name),
      description: str(fd, "description"),
      cover_image_url: str(fd, "cover_image_url"),
      published: bool(fd, "published"),
      sort_order: intOr(fd, "sort_order", 0),
    });
    revalidatePath("/admin/lineas");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminUpdateLinea(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const id = requiredStr(fd, "linea_id", "El identificador");
    await lineasAdminRepo.updateById(id, {
      name: requiredStr(fd, "name", "El nombre"),
      description: str(fd, "description"),
      cover_image_url: str(fd, "cover_image_url"),
      published: bool(fd, "published"),
      sort_order: intOr(fd, "sort_order", 0),
    });
    revalidatePath("/admin/lineas");
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminDeleteLinea(id: string): Promise<void> {
  await requireAdmin();
  await lineasAdminRepo.remove(id);
  revalidatePath("/admin/lineas");
}
