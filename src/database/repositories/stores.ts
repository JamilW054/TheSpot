import type { StoreStatus } from "@/lib/stores/status";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * Tiendas del marketplace. Lecturas de panel/admin con service role (el
 * llamador ya verificó permisos); lecturas públicas con la clave anónima (RLS:
 * solo tiendas aprobadas y columnas públicas).
 */

export interface StoreRow {
  id: string;
  ownerId: string | null;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  businessType: "person" | "company";
  legalName: string | null;
  taxId: string | null;
  contactName: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  notificationEmail: string | null;
  province: string | null;
  city: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  sellsCategories: string[];
  applicationNote: string | null;
  status: StoreStatus;
  statusReason: string | null;
  reviewedAt: string | null;
  isOfficial: boolean;
  trusted: boolean;
  isFeatured: boolean;
  freeShippingMinCents: number | null;
  acceptedPoliciesAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreHistoryRow {
  id: string;
  status: string;
  reason: string | null;
  createdAt: string;
}

export function mapStoreRow(r: Record<string, unknown>): StoreRow {
  return {
    id: String(r.id),
    ownerId: (r.owner_id as string | null) ?? null,
    slug: String(r.slug),
    name: String(r.name),
    tagline: (r.tagline as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    logoUrl: (r.logo_url as string | null) ?? null,
    bannerUrl: (r.banner_url as string | null) ?? null,
    businessType: r.business_type === "company" ? "company" : "person",
    legalName: (r.legal_name as string | null) ?? null,
    taxId: (r.tax_id as string | null) ?? null,
    contactName: (r.contact_name as string | null) ?? null,
    phone: (r.phone as string | null) ?? null,
    whatsapp: (r.whatsapp as string | null) ?? null,
    email: (r.email as string | null) ?? null,
    notificationEmail: (r.notification_email as string | null) ?? null,
    province: (r.province as string | null) ?? null,
    city: (r.city as string | null) ?? null,
    address: (r.address as string | null) ?? null,
    instagram: (r.instagram as string | null) ?? null,
    facebook: (r.facebook as string | null) ?? null,
    website: (r.website as string | null) ?? null,
    sellsCategories: Array.isArray(r.sells_categories)
      ? (r.sells_categories as string[])
      : [],
    applicationNote: (r.application_note as string | null) ?? null,
    status: (r.status as StoreStatus) ?? "pending",
    statusReason: (r.status_reason as string | null) ?? null,
    reviewedAt: (r.reviewed_at as string | null) ?? null,
    isOfficial: Boolean(r.is_official),
    trusted: Boolean(r.trusted),
    isFeatured: Boolean(r.is_featured),
    freeShippingMinCents:
      r.free_shipping_min_cents == null
        ? null
        : Number(r.free_shipping_min_cents),
    acceptedPoliciesAt: (r.accepted_policies_at as string | null) ?? null,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at ?? r.created_at),
  };
}

/** Tienda completa por id (service role). */
export async function getStoreById(id: string): Promise<StoreRow | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapStoreRow(data as Record<string, unknown>) : null;
}

export async function getStoreHistory(
  storeId: string,
): Promise<StoreHistoryRow[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("store_status_history")
    .select("id, status, reason, created_at")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(50);
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    status: String(r.status),
    reason: (r.reason as string | null) ?? null,
    createdAt: String(r.created_at),
  }));
}

export interface StoreListItem {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  status: StoreStatus;
  isOfficial: boolean;
  trusted: boolean;
  isFeatured: boolean;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  province: string | null;
  sellsCategories: string[];
  createdAt: string;
  productCount: number;
  orderCount: number;
}

/** Listado para `/admin/tiendas`. */
export async function listStoresAdmin(opts: {
  status?: StoreStatus | "all";
  q?: string;
}): Promise<StoreListItem[]> {
  const supabase = createServiceClient();
  let query = supabase
    .from("stores")
    .select(
      "id, slug, name, logo_url, status, is_official, trusted, is_featured, contact_name, email, phone, province, sells_categories, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);
  if (opts.status && opts.status !== "all")
    query = query.eq("status", opts.status);
  const q = opts.q?.trim();
  if (q) {
    const safe = q.replace(/[%,()]/g, " ");
    query = query.or(
      `name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`,
    );
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Record<string, unknown>[];
  const ids = rows.map((r) => String(r.id));

  const productCounts = new Map<string, number>();
  const orderCounts = new Map<string, number>();
  if (ids.length > 0) {
    const [{ data: prods }, { data: ords }] = await Promise.all([
      supabase
        .from("products")
        .select("store_id")
        .in("store_id", ids)
        .is("deleted_at", null),
      supabase.from("orders").select("store_id").in("store_id", ids),
    ]);
    for (const p of (prods ?? []) as { store_id: string }[]) {
      productCounts.set(p.store_id, (productCounts.get(p.store_id) ?? 0) + 1);
    }
    for (const o of (ords ?? []) as { store_id: string }[]) {
      orderCounts.set(o.store_id, (orderCounts.get(o.store_id) ?? 0) + 1);
    }
  }

  return rows.map((r) => ({
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    logoUrl: (r.logo_url as string | null) ?? null,
    status: r.status as StoreStatus,
    isOfficial: Boolean(r.is_official),
    trusted: Boolean(r.trusted),
    isFeatured: Boolean(r.is_featured),
    contactName: (r.contact_name as string | null) ?? null,
    email: (r.email as string | null) ?? null,
    phone: (r.phone as string | null) ?? null,
    province: (r.province as string | null) ?? null,
    sellsCategories: Array.isArray(r.sells_categories)
      ? (r.sells_categories as string[])
      : [],
    createdAt: String(r.created_at),
    productCount: productCounts.get(String(r.id)) ?? 0,
    orderCount: orderCounts.get(String(r.id)) ?? 0,
  }));
}

/** Conteo por estado (badges del admin). */
export async function countStoresByStatus(): Promise<
  Record<StoreStatus, number>
> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("stores").select("status");
  const out: Record<StoreStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    suspended: 0,
  };
  for (const r of (data ?? []) as { status: StoreStatus }[]) {
    if (r.status in out) out[r.status] += 1;
  }
  return out;
}

/** Opciones de filtro por tienda (selects del admin). */
export async function listStoreOptions(): Promise<
  { id: string; name: string }[]
> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("stores")
    .select("id, name")
    .in("status", ["approved", "suspended"])
    .order("name");
  return ((data ?? []) as { id: string; name: string }[]).map((r) => ({
    id: r.id,
    name: r.name,
  }));
}

/** Nombres de tiendas por id (para etiquetar pedidos/productos en el admin). */
export async function getStoreNames(
  ids: string[],
): Promise<Map<string, { name: string; slug: string }>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, { name: string; slug: string }>();
  if (unique.length === 0) return map;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("stores")
    .select("id, name, slug")
    .in("id", unique);
  for (const r of (data ?? []) as {
    id: string;
    name: string;
    slug: string;
  }[]) {
    map.set(r.id, { name: r.name, slug: r.slug });
  }
  return map;
}

// ---------------------------------------------------------------------------
// Público
// ---------------------------------------------------------------------------

export interface PublicStore {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  province: string | null;
  city: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  isOfficial: boolean;
  isFeatured: boolean;
  createdAt: string;
}

const PUBLIC_STORE_COLUMNS =
  "id, slug, name, tagline, description, logo_url, banner_url, province, city, instagram, facebook, website, is_official, is_featured, created_at";

function mapPublicStore(r: Record<string, unknown>): PublicStore {
  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    tagline: (r.tagline as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    logoUrl: (r.logo_url as string | null) ?? null,
    bannerUrl: (r.banner_url as string | null) ?? null,
    province: (r.province as string | null) ?? null,
    city: (r.city as string | null) ?? null,
    instagram: (r.instagram as string | null) ?? null,
    facebook: (r.facebook as string | null) ?? null,
    website: (r.website as string | null) ?? null,
    isOfficial: Boolean(r.is_official),
    isFeatured: Boolean(r.is_featured),
    createdAt: String(r.created_at),
  };
}

/** Tiendas aprobadas (directorio `/tiendas`). */
export async function getPublicStores(
  opts: { featuredOnly?: boolean; limit?: number } = {},
): Promise<PublicStore[]> {
  const supabase = await createClient();
  let query = supabase
    .from("stores")
    .select(PUBLIC_STORE_COLUMNS)
    .eq("status", "approved")
    .order("is_official", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("name");
  if (opts.featuredOnly) query = query.eq("is_featured", true);
  if (opts.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) return [];
  return ((data ?? []) as Record<string, unknown>[]).map(mapPublicStore);
}

export async function getPublicStoreBySlug(
  slug: string,
): Promise<PublicStore | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stores")
    .select(PUBLIC_STORE_COLUMNS)
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();
  return data ? mapPublicStore(data as Record<string, unknown>) : null;
}

/** Datos de contacto/cobro de una tienda que el checkout necesita (servidor). */
export interface StoreCheckoutInfo {
  id: string;
  name: string;
  slug: string;
  whatsapp: string | null;
  notificationEmail: string | null;
  freeShippingMinCents: number | null;
  paymentMethods: Record<string, unknown>;
}

export async function getStoresCheckoutInfo(
  ids: string[],
): Promise<Map<string, StoreCheckoutInfo>> {
  const map = new Map<string, StoreCheckoutInfo>();
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return map;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("stores")
    .select(
      "id, name, slug, whatsapp, notification_email, email, free_shipping_min_cents, payment_methods, status",
    )
    .in("id", unique);
  for (const r of (data ?? []) as Record<string, unknown>[]) {
    if (r.status !== "approved") continue;
    map.set(String(r.id), {
      id: String(r.id),
      name: String(r.name),
      slug: String(r.slug),
      whatsapp: (r.whatsapp as string | null) ?? null,
      notificationEmail:
        ((r.notification_email as string | null) ||
          (r.email as string | null)) ??
        null,
      freeShippingMinCents:
        r.free_shipping_min_cents == null
          ? null
          : Number(r.free_shipping_min_cents),
      paymentMethods: (r.payment_methods as Record<string, unknown>) ?? {},
    });
  }
  return map;
}

// ---------------------------------------------------------------------------
// Palabras prohibidas (ajuste de plataforma)
// ---------------------------------------------------------------------------

export const BLOCKED_WORDS_KEY = "marketplace_blocked_words";

export async function getBlockedWords(): Promise<string[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", BLOCKED_WORDS_KEY)
    .maybeSingle();
  const raw = (data as { value: string | null } | null)?.value ?? "";
  return raw
    .split(/[,\n]/)
    .map((w) => w.trim())
    .filter(Boolean);
}
