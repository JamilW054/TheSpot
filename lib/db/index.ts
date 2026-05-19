/**
 * Data access layer: Supabase queries for products, designs, lineas, mockups, orders.
 * Use from Server Components or server actions; for client use React Query or pass data from page.
 */

import { createClient, createServiceClient } from "@/lib/supabase/server";

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
import { type DesignRow, rowToDesign } from "./designs";
import { type LineaRow, rowToLinea } from "./lineas";
import { type OrderRow, rowToPedido, statusMap } from "./orders";
import { type ProductRow, rowToCatalogProduct } from "./products";

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

const productCatalogSelect =
  "id, slug, name, description, price_cents, model_path, cover_image_url, default_design_id, published, sort_order, category_id, tags, sizes, textures!base_texture_id(url), categories(slug)";

const productCatalogSelectCategoryFiltered =
  "id, slug, name, description, price_cents, model_path, cover_image_url, default_design_id, published, sort_order, category_id, tags, sizes, textures!base_texture_id(url), categories!inner(slug)";

export interface GetProductsOptions {
  categorySlug?: string;
  orden?: CatalogOrden;
  etiqueta?: string;
  precio?: CatalogPrecio;
  busqueda?: string;
}

/** Etiquetas distintas en productos publicados (para filtros del catálogo). */
export async function getPublishedCatalogTags(): Promise<string[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("tags")
      .eq("published", true);
    if (error) throw toError(error);
    const set = new Set<string>();
    for (const row of data ?? []) {
      const tags = (row as { tags?: string[] | null }).tags;
      if (!tags) continue;
      for (const t of tags) {
        const x = t?.trim().toLowerCase();
        if (x) set.add(x);
      }
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

    let query = supabase.from("products").select(select).eq("published", true);

    if (slug !== undefined && slug !== "") {
      query = query.eq("categories.slug", slug);
    }

    const tag = options?.etiqueta?.trim().toLowerCase();
    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const busqueda = options?.busqueda?.trim();
    if (busqueda) {
      query = query.ilike("name", `%${busqueda}%`);
    }

    const band = options?.precio;
    if (band === "economico") {
      query = query.lt("price_cents", 2400);
    } else if (band === "medio") {
      query = query.gte("price_cents", 2400).lt("price_cents", 2700);
    } else if (band === "premium") {
      query = query.gte("price_cents", 2700);
    }

    const orden = options?.orden;
    if (orden === "recientes") {
      query = query.order("sort_order", { ascending: false });
    } else if (orden === "precio-menor") {
      query = query.order("price_cents", { ascending: true });
    } else if (orden === "precio-mayor") {
      query = query.order("price_cents", { ascending: false });
    } else if (orden === "az") {
      query = query.order("name", { ascending: true });
    } else {
      query = query.order("sort_order", { ascending: true });
    }

    const { data, error } = await query;
    if (error) throw toError(error);
    return (data ?? []).map((row) => rowToCatalogProduct(row as ProductRow));
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
      .eq("published", true)
      .eq("slug", slug)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw toError(error);
    }
    return data ? rowToCatalogProduct(data as ProductRow) : null;
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
      .eq("published", true)
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw toError(error);
    }
    return data ? rowToCatalogProduct(data as ProductRow) : null;
  }, null);
}

/** Catálogo completo para admin (incluye no publicados). Service role. */
export async function getProductsAdmin(): Promise<ProductRow[]> {
  return withNetworkFallback(async () => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, name, description, price_cents, model_path, cover_image_url, base_texture_id, default_design_id, published, sort_order, category_id, tags, sizes, textures!base_texture_id(url)",
      )
      .order("sort_order", { ascending: true });
    if (error) throw toError(error);
    return (data ?? []) as ProductRow[];
  }, []);
}

/** Producto por slug sin filtrar por published (admin). */
export async function getProductAdminBySlug(
  slug: string,
): Promise<ProductRow | null> {
  const s = slug.trim();
  if (!s) return null;
  return withNetworkFallback(async () => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, slug, name, description, price_cents, model_path, cover_image_url, base_texture_id, default_design_id, published, sort_order, category_id, tags, sizes, textures!base_texture_id(url)",
      )
      .eq("slug", s)
      .maybeSingle();
    if (error) throw toError(error);
    return data ? (data as ProductRow) : null;
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
        "id, shipping_name, total_cents, created_at, payment_status, paid_at",
      )
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false });
    if (error) throw toError(error);
    const rows = data ?? [];
    const fmt = (iso: string) =>
      new Date(iso).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    type PaidRow = {
      id: string;
      shipping_name: string | null;
      total_cents: number;
      created_at: string;
      paid_at: string | null;
    };
    return (rows as PaidRow[]).map((row) => {
      return {
        id: row.id,
        cliente: row.shipping_name ?? "—",
        total: formatDOPFromCents(row.total_cents),
        fechaPedido: fmt(row.created_at),
        fechaPago: row.paid_at ? fmt(row.paid_at) : null,
      };
    });
  }, []);
}

export async function getDesigns(userId?: string | null): Promise<Design[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("designs")
      .select(
        "id, name, slug, description, user_id, source, model_path, garment_color_hex, canvas_elements, cover_image_url, gallery, created_at, updated_at",
      )
      .order("updated_at", { ascending: false });
    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      return [];
    }
    const { data, error } = await query;
    if (error) throw toError(error);
    return (data ?? []).map((row) => rowToDesign(row as DesignRow));
  }, []);
}

export async function getDesignById(id: string): Promise<Design | null> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("designs")
      .select(
        "id, name, slug, description, user_id, source, model_path, garment_color_hex, canvas_elements, cover_image_url, gallery, created_at, updated_at",
      )
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw toError(error);
    }
    return data ? rowToDesign(data as DesignRow) : null;
  }, null);
}

export async function getDesignBySlug(slug: string): Promise<Design | null> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("designs")
      .select(
        "id, name, slug, description, user_id, source, model_path, garment_color_hex, canvas_elements, cover_image_url, gallery, created_at, updated_at",
      )
      .eq("slug", slug)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw toError(error);
    }
    return data ? rowToDesign(data as DesignRow) : null;
  }, null);
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
      .from("product_lineas")
      .select("linea_id");
    const countByLinea = (countsData ?? []).reduce<Record<string, number>>(
      (acc, row) => {
        const lid = (row as { linea_id: string }).linea_id;
        acc[lid] = (acc[lid] ?? 0) + 1;
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
      .from("product_lineas")
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
        "id, user_id, session_id, status, shipping_name, total_cents, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw toError(error);
    return fetchOrdersPedidos((data ?? []) as OrderRow[], supabase);
  }, []);
}

/** All orders (admin). Uses service role, bypasses RLS. */
export async function getOrdersAdmin(): Promise<Pedido[]> {
  return withNetworkFallback(async () => {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, user_id, session_id, status, shipping_name, total_cents, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw toError(error);
    const rows = (data ?? []) as OrderRow[];
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
  if (value === "paid" || value === "declined" || value === "pending")
    return value;
  return "pending";
}

/** Snapshot para validar retorno AZUL (service role). */
export interface OrderPaymentSnapshot {
  id: string;
  total_cents: number;
  payment_provider: string | null;
  payment_status: string;
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
      .select("id, total_cents, payment_provider, payment_status")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as OrderPaymentSnapshot;
    return row;
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

/** Persiste resultado del POST de AZUL (service role, bypass RLS). */
export async function updateOrderPaymentStatusFromGateway(
  params: UpdateOrderPaymentFromGatewayInput,
): Promise<void> {
  const supabase = createServiceClient();
  const approved = params.paymentStatus === "paid";
  const patch: Record<string, unknown> = {
    payment_provider: params.provider,
    payment_status: params.paymentStatus,
    azul_transaction_id: params.transactionId,
    azul_authorization_code: params.authorizationCode,
    azul_response_code: params.responseCode,
    azul_rrn: params.rrn,
    payment_raw_response: params.rawResponse,
  };
  if (approved) {
    patch.status = "paid";
    patch.paid_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", params.orderId);
  if (error) throw toError(error);
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
        "id, status, total_cents, created_at, shipping_name, payment_status, payment_provider, paid_at, azul_transaction_id, azul_authorization_code, azul_response_code",
      )
      .eq("id", id)
      .single();

    if (orderError || !orderRow) return null;
    const o = orderRow as OrderRow & {
      payment_status?: string | null;
      payment_provider?: string | null;
      paid_at?: string | null;
      azul_transaction_id?: string | null;
      azul_authorization_code?: string | null;
      azul_response_code?: string | null;
    };

    const { data: itemsData } = await supabase
      .from("order_items")
      .select(
        "quantity, unit_price_cents, design_id, products(name, slug, cover_image_url), designs(name, cover_image_url)",
      )
      .eq("order_id", id);

    type ItemRow = {
      quantity: number;
      unit_price_cents: number;
      design_id: string | null;
      products?: {
        name: string;
        slug: string;
        cover_image_url: string | null;
      } | null;
      product?: {
        name: string;
        slug: string;
        cover_image_url: string | null;
      } | null;
      designs?: { name: string; cover_image_url: string | null } | null;
      design?: { name: string; cover_image_url: string | null } | null;
    };
    const items = (itemsData ?? []).map((row: ItemRow) => {
      const product = row.products ?? row.product;
      const design = row.designs ?? row.design;
      return {
        productName: product?.name ?? "Producto",
        productSlug: product?.slug ?? "",
        coverImageUrl: product?.cover_image_url ?? "",
        designName: row.design_id
          ? (design?.name ?? "Diseño personalizado")
          : null,
        designCoverImageUrl:
          row.design_id && design?.cover_image_url
            ? design.cover_image_url
            : null,
        quantity: row.quantity,
        unitPriceCents: row.unit_price_cents,
      };
    });

    return {
      id: o.id,
      status: statusMap[o.status] ?? "pendiente",
      totalCents: o.total_cents,
      createdAt: new Date(o.created_at).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      shippingName: o.shipping_name,
      items,
      paymentStatus: coercePaymentStatus(o.payment_status ?? undefined),
      paymentProvider: o.payment_provider ?? null,
      paidAt: o.paid_at ?? null,
      azulTransactionId: o.azul_transaction_id ?? null,
      azulAuthorizationCode: o.azul_authorization_code ?? null,
      azulResponseCode: o.azul_response_code ?? null,
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

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      session_id: null,
      status: "pending",
      shipping_name: shipping.name.trim(),
      shipping_email: shipping.email.trim(),
      shipping_address: shipping.address.trim(),
      shipping_phone: shipping.phone?.trim() ?? null,
      shipping_city: shipping.city?.trim() ?? null,
      shipping_postal_code: shipping.postalCode?.trim() ?? null,
      shipping_country: shipping.country?.trim() ?? null,
      total_cents: 0,
      payment_status: "pending",
      payment_provider: null,
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
    totalCents += product.priceCents * item.quantity;
    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: orderId,
      product_id: item.productId,
      design_id: item.designId ?? null,
      quantity: item.quantity,
      unit_price_cents: product.priceCents,
      size: item.size ?? null,
    });
    if (itemError) throw toError(itemError);
  }

  const { error: totalErr } = await supabase
    .from("orders")
    .update({ total_cents: totalCents })
    .eq("id", orderId);
  if (totalErr) throw toError(totalErr);

  return { orderId };
}
