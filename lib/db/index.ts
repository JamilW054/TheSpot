/**
 * Data access layer: Supabase queries for products, designs, lineas, mockups, orders.
 * Use from Server Components or server actions; for client use React Query or pass data from page.
 */

import { createClient, createServiceClient } from "@/lib/supabase/server";

/** Convert Supabase/PostgREST error to a plain Error so Next.js and UI show a readable message. */
function toError(err: { message?: string; code?: string; details?: string }): Error {
  const msg = err?.message ?? "Error de base de datos";
  const e = new Error(msg);
  if (err?.code) (e as Error & { code?: string }).code = err.code;
  return e;
}

/** True if the error is a connection/network failure (timeout, unreachable, etc.). */
function isNetworkError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const details = typeof (err as { details?: string })?.details === "string" ? (err as { details: string }).details : "";
  const s = (msg + " " + details).toLowerCase();
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
async function withNetworkFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isNetworkError(err)) return fallback;
    throw err instanceof Error ? err : toError(err as { message?: string });
  }
}

import {
  rowToCatalogProduct,
  type ProductRow,
} from "./products";
import { rowToDesign, type DesignRow } from "./designs";
import { rowToLinea, type LineaRow } from "./lineas";
import { rowToMockup, type BaseModelRow } from "./base-models";
import { rowToPedido, type OrderRow } from "./orders";
import { statusMap } from "./orders";
import type { CatalogProduct, Design, Linea, Mockup, OrderStatusDetail, Pedido } from "@/types";

export async function getProducts(): Promise<CatalogProduct[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, description, price_cents, model_path, cover_image_url, default_design_id, published, sort_order, textures!base_texture_id(url)")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw toError(error);
    return (data ?? []).map((row) => rowToCatalogProduct(row as ProductRow));
  }, []);
}

export async function getProductBySlug(
  slug: string
): Promise<CatalogProduct | null> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, description, price_cents, model_path, cover_image_url, default_design_id, published, sort_order, textures!base_texture_id(url)")
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
  id: string
): Promise<CatalogProduct | null> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, description, price_cents, model_path, cover_image_url, default_design_id, published, sort_order, textures!base_texture_id(url)")
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

export async function getDesigns(userId?: string | null): Promise<Design[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("designs")
      .select("id, name, slug, description, user_id, source, model_path, garment_color_hex, canvas_elements, cover_image_url, gallery, created_at, updated_at")
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
      .select("id, name, slug, description, user_id, source, model_path, garment_color_hex, canvas_elements, cover_image_url, gallery, created_at, updated_at")
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
      .select("id, name, slug, description, user_id, source, model_path, garment_color_hex, canvas_elements, cover_image_url, gallery, created_at, updated_at")
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
      .select("id, slug, name, description, cover_image_url, gallery, published, sort_order")
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
    {}
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
    .select("id, slug, name, description, cover_image_url, gallery, published, sort_order")
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

async function fetchOrdersPedidos(
  ordersData: OrderRow[],
  supabase: Awaited<ReturnType<typeof createClient>>
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
    .select("id, user_id, session_id, status, shipping_name, total_cents, created_at")
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
    .select("id, user_id, session_id, status, shipping_name, total_cents, created_at")
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

/** Consulta pública: obtiene el estado de un pedido por ID (sin auth). Usa service role. */
export async function getOrderStatusById(orderId: string): Promise<OrderStatusDetail | null> {
  if (!orderId?.trim()) return null;
  const id = orderId.trim().toLowerCase();
  try {
    const supabase = createServiceClient();
    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .select("id, status, total_cents, created_at, shipping_name")
      .eq("id", id)
      .single();

    if (orderError || !orderRow) return null;
    const o = orderRow as OrderRow;

    const { data: itemsData } = await supabase
      .from("order_items")
      .select("quantity, unit_price_cents, design_id, products(name, slug, cover_image_url), designs(name, cover_image_url)")
      .eq("order_id", id);

    type ItemRow = {
      quantity: number;
      unit_price_cents: number;
      design_id: string | null;
      products?: { name: string; slug: string; cover_image_url: string | null } | null;
      product?: { name: string; slug: string; cover_image_url: string | null } | null;
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
        designCoverImageUrl: row.design_id && design?.cover_image_url ? design.cover_image_url : null,
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
  _sessionId?: string | null
): Promise<{ orderId: string }> {
  if (items.length === 0) throw new Error("El carrito está vacío");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
    })
    .select("id")
    .single();

  if (orderError || !orderRow) throw toError(orderError ?? { message: "Error al crear el pedido" });

  const orderId = (orderRow as { id: string }).id;

  for (const item of items) {
    const product = await getProductById(item.productId);
    if (!product) throw new Error(`Producto no encontrado: ${item.productId}`);
    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: orderId,
      product_id: item.productId,
      design_id: item.designId ?? null,
      quantity: item.quantity,
      unit_price_cents: product.priceCents,
    });
    if (itemError) throw toError(itemError);
  }

  return { orderId };
}
