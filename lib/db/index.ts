/**
 * Data access layer: Supabase queries for products, designs, lineas, mockups, orders.
 * Use from Server Components or server actions; for client use React Query or pass data from page.
 */

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime } from "@/lib/format-date";

/** Convert Supabase/PostgREST error to a plain Error so Next.js and UI show a readable message. */
function toError(err: {
  message?: string;
  code?: string;
  details?: string;
}): Error {
  const msg = err?.message ?? "Error de base de datos";
  const e = new Error(msg);
  if (err?.code) (e as Error & { code?: string }).code = err.code;
  return e;
}

/** True if the error is a connection/network failure (timeout, unreachable, etc.). */
function isNetworkError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const details =
    typeof (err as { details?: string })?.details === "string"
      ? (err as { details: string }).details
      : "";
  const s = `${msg} ${details}`.toLowerCase();
  return (
    s.includes("fetch failed") ||
    s.includes("connecttimeout") ||
    s.includes("connect timeout") ||
    s.includes("und_err_connect_timeout") ||
    s.includes("econnrefused") ||
    s.includes("enotfound") ||
    s.includes("network") ||
    s.includes("timeout")
  );
}

/** Run a DB query; on network error return fallback so the app still renders. */
async function withNetworkFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isNetworkError(err)) return fallback;
    throw err instanceof Error ? err : toError(err as { message?: string });
  }
}

import type { CatalogOrden, CatalogPrecio } from "@/lib/catalog-query";
import { formatDOPFromCents } from "@/lib/format-currency";
import type {
  CatalogProduct,
  Design,
  Linea,
  Mockup,
  OrderPaymentStatus,
  OrderStatusDetail,
  Pedido,
} from "@/types";
import { type BaseModelRow, rowToMockup } from "./base-models";
import {
  type CategoryRow,
  getCategoriesForAdmin,
  getCategoriesPublic,
  getCategoryAdminById,
  getCategoryCoverByCategoryId,
} from "./categories";
import { DESIGN_SELECT, type DesignRow, rowToDesign } from "./designs";
import { type LineaRow, rowToLinea } from "./lineas";
import {
  customerNameFromOrder,
  type OrderRow,
  rowToPedido,
  type ShippingAddress,
  statusMap,
} from "./orders";
import {
  type AdminProductRow,
  PRODUCT_ADMIN_SELECT,
  PRODUCT_CATALOG_SELECT,
  type ProductRow,
  rowToCatalogProduct,
  tagsFromRow,
} from "./products";

export {
  formatGiveawayNumber,
  getGiveawayGoalPurchases,
  getGiveawayPaidPurchaseCount,
} from "./giveaway-stats";
export type { CategoryRow };
export {
  getCategoriesForAdmin,
  getCategoriesPublic,
  getCategoryAdminById,
  getCategoryCoverByCategoryId,
};

const productCatalogSelect = PRODUCT_CATALOG_SELECT;

const productCatalogSelectCategoryFiltered = PRODUCT_CATALOG_SELECT.replace(
  "categories(slug)",
  "categories!inner(slug)",
);

export interface GetProductsOptions {
  categorySlug?: string;
  orden?: CatalogOrden;
  etiqueta?: string;
  precio?: CatalogPrecio;
  busqueda?: string;
}

/** Etiquetas distintas (slugs) para filtros del catálogo. */
export async function getPublishedCatalogTags(): Promise<string[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tags")
      .select("slug")
      .order("slug", { ascending: true });
    if (error) throw toError(error);
    const set = new Set<string>();
    for (const row of data ?? []) {
      const slug = (row as { slug?: string | null }).slug?.trim().toLowerCase();
      if (slug) set.add(slug);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);
}

export async function getProducts(
  options?: GetProductsOptions,
): Promise<CatalogProduct[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const slug = options?.categorySlug?.trim();
    const select =
      slug !== undefined && slug !== ""
        ? productCatalogSelectCategoryFiltered
        : productCatalogSelect;

    let query = supabase.from("products").select(select).eq("is_active", true);

    if (slug !== undefined && slug !== "") {
      query = query.eq("categories.slug", slug);
    }

    const busqueda = options?.busqueda?.trim();
    if (busqueda) {
      query = query.ilike("name", `%${busqueda}%`);
    }

    const band = options?.precio;
    if (band === "economico") {
      query = query.lt("base_price_cents", 2400);
    } else if (band === "medio") {
      query = query.gte("base_price_cents", 2400).lt("base_price_cents", 2700);
    } else if (band === "premium") {
      query = query.gte("base_price_cents", 2700);
    }

    const orden = options?.orden;
    if (orden === "recientes") {
      query = query.order("created_at", { ascending: false });
    } else if (orden === "precio-menor") {
      query = query.order("base_price_cents", { ascending: true });
    } else if (orden === "precio-mayor") {
      query = query.order("base_price_cents", { ascending: false });
    } else if (orden === "az") {
      query = query.order("name", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw toError(error);
    let products = (data ?? []).map((row) =>
      rowToCatalogProduct(row as unknown as ProductRow),
    );

    // Filtro por etiqueta: se aplica en memoria sobre el join product_tags.
    const tag = options?.etiqueta?.trim().toLowerCase();
    if (tag) {
      const tagged = new Set(
        (data ?? [])
          .filter((row) =>
            tagsFromRow((row as unknown as ProductRow).product_tags).includes(
              tag,
            ),
          )
          .map((row) => (row as unknown as ProductRow).id),
      );
      products = products.filter((p) => tagged.has(p.id));
    }

    return products;
  }, []);
}

export async function getProductBySlug(
  slug: string,
): Promise<CatalogProduct | null> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(productCatalogSelect)
      .eq("is_active", true)
      .eq("slug", slug)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw toError(error);
    }
    return data ? rowToCatalogProduct(data as unknown as ProductRow) : null;
  }, null);
}

export async function getProductById(
  id: string,
): Promise<CatalogProduct | null> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(productCatalogSelect)
      .eq("is_active", true)
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw toError(error);
    }
    return data ? rowToCatalogProduct(data as unknown as ProductRow) : null;
  }, null);
}

export async function getProductsByIds(
  ids: string[],
): Promise<CatalogProduct[]> {
  if (ids.length === 0) return [];
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(productCatalogSelect)
      .eq("is_active", true)
      .in("id", ids);
    if (error) throw toError(error);
    return (data ?? []).map((row) =>
      rowToCatalogProduct(row as unknown as ProductRow),
    );
  }, []);
}

/** Catálogo completo para admin (incluye no publicados). Service role. */
export async function getProductsAdmin(): Promise<AdminProductRow[]> {
  return withNetworkFallback(async () => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_ADMIN_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw toError(error);
    return (data ?? []) as unknown as AdminProductRow[];
  }, []);
}

/** Producto por slug sin filtrar por is_active (admin). */
export async function getProductAdminBySlug(
  slug: string,
): Promise<AdminProductRow | null> {
  const s = slug.trim();
  if (!s) return null;
  return withNetworkFallback(async () => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_ADMIN_SELECT)
      .eq("slug", s)
      .maybeSingle();
    if (error) throw toError(error);
    return data ? (data as unknown as AdminProductRow) : null;
  }, null);
}

/** Pedidos con cobro confirmado en pasarela (base para listado tipo factura). */
export interface FacturaPedidoListado {
  id: string;
  cliente: string;
  total: string;
  fechaPedido: string;
  fechaPago: string | null;
}

export async function getFacturasPedidosPagadosAdmin(): Promise<
  FacturaPedidoListado[]
> {
  return withNetworkFallback(async () => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, shipping_address, contact_email, total_cents, created_at, payment_status, payment_transactions(paid_at)",
      )
      .order("created_at", { ascending: false });
    if (error) throw toError(error);
    const rows = data ?? [];
    const fmt = (iso: string) =>
      formatDateTime(iso, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    type PaidRow = {
      id: string;
      shipping_address: ShippingAddress | null;
      contact_email: string | null;
      total_cents: number;
      created_at: string;
      payment_transactions?: { paid_at: string | null }[] | null;
    };
    return (rows as unknown as PaidRow[]).map((row) => {
      const paidAt = (row.payment_transactions ?? [])
        .map((t) => t.paid_at)
        .filter((d): d is string => Boolean(d))
        .sort()
        .at(-1);
      return {
        id: row.id,
        cliente: customerNameFromOrder(row.shipping_address, row.contact_email),
        total: formatDOPFromCents(row.total_cents),
        fechaPedido: fmt(row.created_at),
        fechaPago: paidAt ? fmt(paidAt) : null,
      };
    });
  }, []);
}

export async function getDesigns(userId?: string | null): Promise<Design[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("designs")
      .select(DESIGN_SELECT)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      return [];
    }
    const { data, error } = await query;
    if (error) throw toError(error);
    return (data ?? []).map((row) => rowToDesign(row as unknown as DesignRow));
  }, []);
}

export async function getDesignById(id: string): Promise<Design | null> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("designs")
      .select(DESIGN_SELECT)
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw toError(error);
    }
    return data ? rowToDesign(data as unknown as DesignRow) : null;
  }, null);
}

export async function getDesignBySlug(slug: string): Promise<Design | null> {
  // El esquema nuevo no tiene `slug` en designs; se resuelve por id.
  return getDesignById(slug);
}

export async function getLineas(): Promise<Linea[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data: lineasData, error: lineasError } = await supabase
      .from("lineas")
      .select(
        "id, slug, name, description, cover_image_url, gallery, published, sort_order",
      )
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (lineasError) throw toError(lineasError);

    const { data: countsData } = await supabase
      .from("products")
      .select("linea_id")
      .not("linea_id", "is", null);
    const countByLinea = (countsData ?? []).reduce<Record<string, number>>(
      (acc, row) => {
        const lid = (row as { linea_id: string | null }).linea_id;
        if (lid) acc[lid] = (acc[lid] ?? 0) + 1;
        return acc;
      },
      {},
    );

    return (lineasData ?? []).map((row) => {
      const r = row as LineaRow;
      return rowToLinea(r, countByLinea[r.id] ?? 0);
    });
  }, []);
}

export async function getLineaBySlug(slug: string): Promise<Linea | null> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data: linea, error } = await supabase
      .from("lineas")
      .select(
        "id, slug, name, description, cover_image_url, gallery, published, sort_order",
      )
      .eq("slug", slug)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw toError(error);
    }
    if (!linea) return null;

    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("linea_id", linea.id);
    return rowToLinea(linea as LineaRow, count ?? 0);
  }, null);
}

export async function getMockups(): Promise<Mockup[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("base_models")
      .select("id, path, name")
      .order("path");
    if (error) throw toError(error);
    return (data ?? []).map((row) => rowToMockup(row as BaseModelRow));
  }, []);
}

/** Lista de modelos base (p. ej. editor / mockups). */
export async function getBaseModelsForAdmin(): Promise<BaseModelRow[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("base_models")
      .select("id, path, name")
      .order("path");
    if (error) throw toError(error);
    return (data ?? []) as BaseModelRow[];
  }, []);
}

async function fetchOrdersPedidos(
  ordersData: OrderRow[],
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Pedido[]> {
  const orderIds = ordersData.map((o) => o.id);
  const counts: Record<string, number> = {};
  if (orderIds.length > 0) {
    const { data: itemsData } = await supabase
      .from("order_items")
      .select("order_id")
      .in("order_id", orderIds);
    for (const row of itemsData ?? []) {
      const oid = (row as { order_id: string }).order_id;
      counts[oid] = (counts[oid] ?? 0) + 1;
    }
  }
  return ordersData.map((r) => rowToPedido(r, counts[r.id] ?? 0));
}

/** Orders for current user (RLS). */
export async function getOrders(): Promise<Pedido[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, user_id, status, shipping_address, contact_email, total_cents, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw toError(error);
    return fetchOrdersPedidos((data ?? []) as unknown as OrderRow[], supabase);
  }, []);
}

/** All orders (admin). Uses service role, bypasses RLS. */
export async function getOrdersAdmin(): Promise<Pedido[]> {
  return withNetworkFallback(async () => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, user_id, status, shipping_address, contact_email, total_cents, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw toError(error);
    const rows = (data ?? []) as unknown as OrderRow[];
    const orderIds = rows.map((o) => o.id);
    const counts: Record<string, number> = {};
    if (orderIds.length > 0) {
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("order_id")
        .in("order_id", orderIds);
      for (const row of itemsData ?? []) {
        const oid = (row as { order_id: string }).order_id;
        counts[oid] = (counts[oid] ?? 0) + 1;
      }
    }
    return rows.map((r) => rowToPedido(r, counts[r.id] ?? 0));
  }, []);
}

function coercePaymentStatus(
  value: string | null | undefined,
): OrderPaymentStatus {
  if (value === "paid" || value === "pending") return value;
  if (value === "failed" || value === "declined") return "declined";
  return "pending";
}

/** Snapshot para validar retorno AZUL (service role). */
export interface OrderPaymentSnapshot {
  id: string;
  total_cents: number;
  payment_provider: string | null;
  payment_status: string;
}

/** payment_status (DB enum) → estado de pago de la app. */
function dbToAppPaymentStatus(
  value: string | null | undefined,
): OrderPaymentStatus {
  if (value === "paid") return "paid";
  if (value === "failed") return "declined";
  return "pending";
}

export async function getOrderPaymentSnapshotByOrderNumber(
  orderNumber: string,
): Promise<OrderPaymentSnapshot | null> {
  const id = orderNumber.trim().toLowerCase();
  if (!id) return null;
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("orders")
      .select("id, total_cents, payment_status, payment_transactions(provider)")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as unknown as {
      id: string;
      total_cents: number;
      payment_status: string;
      payment_transactions?: { provider: string | null }[] | null;
    };
    return {
      id: row.id,
      total_cents: row.total_cents,
      payment_provider: row.payment_transactions?.[0]?.provider ?? null,
      payment_status: dbToAppPaymentStatus(row.payment_status),
    };
  } catch {
    return null;
  }
}

export interface UpdateOrderPaymentFromGatewayInput {
  orderId: string;
  paymentStatus: OrderPaymentStatus;
  provider: string;
  transactionId: string | null;
  responseCode: string | null;
  authorizationCode: string | null;
  rrn: string | null;
  rawResponse: Record<string, string>;
}

/** Normaliza el proveedor al enum payment_provider (minúsculas). */
function normalizeProvider(provider: string): string {
  const p = provider.trim().toLowerCase();
  const allowed = [
    "azul",
    "stripe",
    "paypal",
    "cash_on_delivery",
    "bank_transfer",
  ];
  return allowed.includes(p) ? p : "azul";
}

/** Persiste resultado del POST de AZUL: actualiza orders + registra payment_transactions. */
export async function updateOrderPaymentStatusFromGateway(
  params: UpdateOrderPaymentFromGatewayInput,
): Promise<void> {
  const supabase = createServiceClient();
  const approved = params.paymentStatus === "paid";
  const nowIso = new Date().toISOString();
  const dbPaymentStatus = approved ? "paid" : "failed";

  // Estado del pedido y del pago a nivel de orders.
  const orderPatch: Record<string, unknown> = {
    payment_status: dbPaymentStatus,
    updated_at: nowIso,
  };
  if (approved) orderPatch.status = "confirmed";

  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .update(orderPatch)
    .eq("id", params.orderId)
    .select("total_cents")
    .single();
  if (orderErr) throw toError(orderErr);
  const amountCents =
    (orderRow as { total_cents?: number } | null)?.total_cents ?? 0;

  // Registro de la transacción de pago.
  const { error: txErr } = await supabase.from("payment_transactions").insert({
    order_id: params.orderId,
    provider: normalizeProvider(params.provider),
    status: dbPaymentStatus,
    amount_cents: amountCents,
    currency: "DOP",
    provider_tx_id: params.transactionId,
    provider_auth_code: params.authorizationCode,
    provider_ref_id: params.rrn,
    provider_ref_2: params.responseCode,
    failure_reason: approved ? null : params.responseCode,
    failed_at: approved ? null : nowIso,
    paid_at: approved ? nowIso : null,
    metadata: params.rawResponse,
  });
  if (txErr) throw toError(txErr);
}

/** Consulta pública: obtiene el estado de un pedido por ID (sin auth). Usa service role. */
export async function getOrderStatusById(
  orderId: string,
): Promise<OrderStatusDetail | null> {
  if (!orderId?.trim()) return null;
  const id = orderId.trim().toLowerCase();
  try {
    const supabase = createServiceClient();
    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, status, total_cents, created_at, shipping_address, contact_email, payment_status, payment_transactions(provider, paid_at, provider_tx_id, provider_auth_code, provider_ref_2, status, created_at)",
      )
      .eq("id", id)
      .single();

    if (orderError || !orderRow) return null;
    const o = orderRow as unknown as {
      id: string;
      status: string;
      total_cents: number;
      created_at: string;
      shipping_address: ShippingAddress | null;
      contact_email: string | null;
      payment_status: string | null;
      payment_transactions?:
        | {
            provider: string | null;
            paid_at: string | null;
            provider_tx_id: string | null;
            provider_auth_code: string | null;
            provider_ref_2: string | null;
            status: string | null;
            created_at: string;
          }[]
        | null;
    };

    // Última transacción de pago registrada.
    const tx = [...(o.payment_transactions ?? [])].sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1,
    )[0];

    const { data: itemsData } = await supabase
      .from("order_items")
      .select(
        "quantity, unit_price_cents, design_id, product_snapshot, designs(name, thumbnail_url, preview_url)",
      )
      .eq("order_id", id);

    type Snapshot = {
      name?: string;
      slug?: string;
      cover_image_url?: string;
    };
    type ItemRow = {
      quantity: number;
      unit_price_cents: number;
      design_id: string | null;
      product_snapshot?: Snapshot | null;
      designs?:
        | {
            name: string | null;
            thumbnail_url: string | null;
            preview_url: string | null;
          }
        | {
            name: string | null;
            thumbnail_url: string | null;
            preview_url: string | null;
          }[]
        | null;
    };
    const items = ((itemsData ?? []) as unknown as ItemRow[]).map((row) => {
      const snap = row.product_snapshot ?? {};
      const design = Array.isArray(row.designs) ? row.designs[0] : row.designs;
      return {
        productName: snap.name ?? "Producto",
        productSlug: snap.slug ?? "",
        coverImageUrl: snap.cover_image_url ?? "",
        designName: row.design_id
          ? (design?.name ?? "Diseño personalizado")
          : null,
        designCoverImageUrl: row.design_id
          ? (design?.thumbnail_url ?? design?.preview_url ?? null)
          : null,
        quantity: row.quantity,
        unitPriceCents: row.unit_price_cents,
      };
    });

    return {
      id: o.id,
      status: statusMap[o.status] ?? "pendiente",
      totalCents: o.total_cents,
      createdAt: formatDateTime(o.created_at, { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      shippingName: customerNameFromOrder(o.shipping_address, o.contact_email),
      items,
      paymentStatus: coercePaymentStatus(o.payment_status ?? undefined),
      paymentProvider: tx?.provider ?? null,
      paidAt: tx?.paid_at ?? null,
      azulTransactionId: tx?.provider_tx_id ?? null,
      azulAuthorizationCode: tx?.provider_auth_code ?? null,
      azulResponseCode: tx?.provider_ref_2 ?? null,
    };
  } catch {
    return null;
  }
}

/** Item for creating an order (from cart). */
export interface CreateOrderItem {
  productId: string;
  quantity: number;
  designId?: string | null;
  size?: string | null;
}

/** Shipping data for order creation. */
export interface CreateOrderShipping {
  name: string;
  email: string;
  address: string;
  phone?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Creates an order and its order_items from cart data. Requires an active session (user_id mandatory).
 * Returns the order id or throws.
 */
export async function createOrder(
  shipping: CreateOrderShipping,
  items: CreateOrderItem[],
  _sessionId?: string | null,
): Promise<{ orderId: string }> {
  if (items.length === 0) throw new Error("El carrito está vacío");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Debes iniciar sesión para realizar la compra.");
  }

  const shippingAddress: ShippingAddress = {
    full_name: shipping.name.trim(),
    email: shipping.email.trim(),
    address_line1: shipping.address.trim(),
    phone: shipping.phone?.trim() ?? null,
    city: shipping.city?.trim() ?? null,
    postal_code: shipping.postalCode?.trim() ?? null,
    country_code: shipping.country?.trim() || "DO",
  };

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      payment_status: "pending",
      subtotal_cents: 0,
      total_cents: 0,
      shipping_address: shippingAddress,
      contact_email: shipping.email.trim(),
    })
    .select("id")
    .single();

  if (orderError || !orderRow)
    throw toError(orderError ?? { message: "Error al crear el pedido" });

  const orderId = (orderRow as { id: string }).id;

  let totalCents = 0;
  for (const item of items) {
    const product = await getProductById(item.productId);
    if (!product) throw new Error(`Producto no encontrado: ${item.productId}`);

    const resolved = await resolveVariantForOrder(
      supabase,
      item.productId,
      item.size ?? null,
    );
    const unitPrice = resolved?.priceCents ?? product.priceCents;
    const lineTotal = unitPrice * item.quantity;
    totalCents += lineTotal;

    const snapshot = {
      name: product.name,
      slug: product.slug,
      cover_image_url: product.coverImage,
      size: item.size ?? null,
    };

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: orderId,
      variant_id: resolved?.variantId ?? null,
      design_id: item.designId ?? null,
      quantity: item.quantity,
      unit_price_cents: unitPrice,
      total_price_cents: lineTotal,
      size: item.size ?? null,
      product_snapshot: snapshot,
    });
    if (itemError) throw toError(itemError);
  }

  const { error: totalErr } = await supabase
    .from("orders")
    .update({ subtotal_cents: totalCents, total_cents: totalCents })
    .eq("id", orderId);
  if (totalErr) throw toError(totalErr);

  return { orderId };
}

/** Resuelve la variante de un producto para una talla dada (o la primera activa). */
async function resolveVariantForOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  size: string | null,
): Promise<{ variantId: string; priceCents: number | null } | null> {
  const { data } = await supabase
    .from("product_variants")
    .select("id, price_cents, attributes, is_active, sort_order")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  const variants = (data ?? []) as unknown as {
    id: string;
    price_cents: number | null;
    attributes: Record<string, unknown> | null;
    sort_order: number;
  }[];
  if (variants.length === 0) return null;
  const wanted = size?.trim().toLowerCase();
  const match = wanted
    ? variants.find(
        (v) =>
          typeof v.attributes?.size === "string" &&
          (v.attributes.size as string).toLowerCase() === wanted,
      )
    : undefined;
  const chosen = match ?? variants[0];
  return { variantId: chosen.id, priceCents: chosen.price_cents };
}
