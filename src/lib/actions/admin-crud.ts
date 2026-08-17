"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  brandsRepo,
  couponsRepo,
  shippingMethodsRepo,
} from "@/database/repositories/repositories";
import type { Repository } from "@/database/repositories/repository";
import { slugify } from "@/lib/slug";

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

