/**
 * Data access layer: Supabase queries for products, designs, lineas, mockups, orders.
 * Use from Server Components or server actions; for client use React Query or pass data from page.
 */

import { formatDateTime } from "@/lib/format-date";
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
import type { OrderStatusFilter } from "@/lib/orders/status";
import type {
  CatalogProduct,
  OrderPaymentStatus,
  OrderStatusDetail,
  Pedido,
  PedidoLineItem,
} from "@/types";
import {
  type CategoryRow,
  getCategoriesForAdmin,
  getCategoriesPublic,
  getCategoryAdminById,
  getCategoryCoverByCategoryId,
} from "./categories";
import {
  customerNameFromOrder,
  type OrderItemRow,
  type OrderRow,
  rowToLineItem,
  rowToPedido,
  type ShippingAddress,
  statusMap,
} from "./orders";
import {
  type AdminProductRow,
  colorsFromVariants,
  PRODUCT_ADMIN_SELECT,
  PRODUCT_ADMIN_SELECT_LEGACY,
  PRODUCT_CATALOG_SELECT,
  type ProductRow,
  rowToCatalogProduct,
  tagsFromRow,
} from "./products";
import { paymentMethodLabel } from "./payments";
import { sendOrderReceiptEmail } from "./receipts";

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
  color?: string;
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

/** Colores distintos (label + hex) entre variantes activas de productos publicados. */
export async function getPublishedCatalogColors(): Promise<
  { label: string; hex: string | null }[]
> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("product_variants(attributes, is_active, sort_order)")
      .eq("is_active", true);
    if (error) throw toError(error);
    const byKey = new Map<string, { label: string; hex: string | null }>();
    for (const row of data ?? []) {
      const colors = colorsFromVariants(
        (row as unknown as ProductRow).product_variants,
      );
      for (const c of colors) {
        const key = c.label.toLowerCase();
        if (!byKey.has(key)) byKey.set(key, c);
      }
    }
    return Array.from(byKey.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
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

    // Bandas de precio definidas por el cliente: Accesible < RD$2,000,
    // Medio RD$2,000–6,000, Premium > RD$6,000 (base_price_cents en céntimos).
    const band = options?.precio;
    if (band === "economico") {
      query = query.lt("base_price_cents", 200_000);
    } else if (band === "medio") {
      query = query
        .gte("base_price_cents", 200_000)
        .lt("base_price_cents", 600_000);
    } else if (band === "premium") {
      query = query.gte("base_price_cents", 600_000);
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

    // Filtro por color: se aplica en memoria sobre `colors` (derivado de
    // product_variants.attributes, no es una columna filtrable en SQL).
    const color = options?.color?.trim().toLowerCase();
    if (color) {
      products = products.filter((p) =>
        p.colors.some((c) => c.label.toLowerCase() === color),
      );
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

/** PostgREST: columna inexistente (migración 00023 pendiente). */
const UNDEFINED_COLUMN = "42703";

/** Catálogo completo para admin (incluye no publicados). Service role. */
export async function getProductsAdmin(): Promise<AdminProductRow[]> {
  return withNetworkFallback(async () => {
    const supabase = createServiceClient();
    let { data, error } = await supabase
      .from("products")
      .select(PRODUCT_ADMIN_SELECT)
      .order("created_at", { ascending: false });
    // BD sin `cost_cents` todavía: reintenta sin la columna.
    if (error?.code === UNDEFINED_COLUMN) {
      ({ data, error } = await supabase
        .from("products")
        .select(PRODUCT_ADMIN_SELECT_LEGACY)
        .order("created_at", { ascending: false }));
    }
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
    let { data, error } = await supabase
      .from("products")
      .select(PRODUCT_ADMIN_SELECT)
      .eq("slug", s)
      .maybeSingle();
    if (error?.code === UNDEFINED_COLUMN) {
      ({ data, error } = await supabase
        .from("products")
        .select(PRODUCT_ADMIN_SELECT_LEGACY)
        .eq("slug", s)
        .maybeSingle());
    }
    if (error) throw toError(error);
    return data ? (data as unknown as AdminProductRow) : null;
  }, null);
}

async function fetchOrdersPedidos(
  ordersData: OrderRow[],
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Pedido[]> {
  const orderIds = ordersData.map((o) => o.id);
  const lineItemsByOrder: Record<string, PedidoLineItem[]> = {};
  if (orderIds.length > 0) {
    const { data: itemsData } = await supabase
      .from("order_items")
      .select("order_id, quantity, product_snapshot")
      .in("order_id", orderIds);
    for (const row of (itemsData ?? []) as unknown as OrderItemRow[]) {
      const oid = row.order_id;
      if (!oid) continue;
      (lineItemsByOrder[oid] ??= []).push(rowToLineItem(row));
    }
  }
  return ordersData.map((r) => rowToPedido(r, lineItemsByOrder[r.id] ?? []));
}

/** Orders for current user. Filtra por user_id además de RLS (defensa en profundidad). */
export async function getOrders(): Promise<Pedido[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, user_id, status, payment_status, shipping_address, contact_email, total_cents, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw toError(error);
    return fetchOrdersPedidos((data ?? []) as unknown as OrderRow[], supabase);
  }, []);
}

/** Subconjunto de PostgREST usado para componer el filtro de estado. */
interface OrdersQueryBuilder {
  eq(column: string, value: unknown): this;
  neq(column: string, value: unknown): this;
  or(filters: string): this;
}

/**
 * Valor de `orders.payment_status` que representa un cobro exitoso. La columna
 * solo admite 'pending' | 'paid' | 'declined' (`OrderPaymentStatus`; constraint
 * de la migración 00004 y enum en la BD desplegada), así que el filtro en SQL
 * compara contra 'paid'. Los sinónimos de `SUCCESSFUL_PAYMENT_STATUSES` sirven
 * para normalizar respuestas de pasarelas al leerlas, no para consultar aquí:
 * la BD rechaza cualquier valor fuera del enum.
 */
const PAID_PAYMENT_STATUS: OrderPaymentStatus = "paid";

/**
 * Traduce un `OrderStatusFilter` a condiciones sobre `orders` y las aplica a la
 * consulta (filtrado en la BD, no en memoria). Los tres estados son excluyentes:
 * un pedido cancelado nunca aparece en "pagados" ni en "pendientes".
 */
function applyOrderStatusFilter<Q extends OrdersQueryBuilder>(
  query: Q,
  status: OrderStatusFilter,
): Q {
  switch (status) {
    case "paid":
      return query
        .neq("status", "cancelled")
        .eq("payment_status", PAID_PAYMENT_STATUS);
    case "cancelled":
      return query.eq("status", "cancelled");
    default:
      // Pendiente = ni cancelado ni cobrado (incluye payment_status nulo).
      return query
        .neq("status", "cancelled")
        .or(
          `payment_status.is.null,payment_status.neq.${PAID_PAYMENT_STATUS}`,
        );
  }
}

export interface GetOrdersAdminOptions {
  /** Filtra por estado en la consulta; sin valor devuelve todos los pedidos. */
  status?: OrderStatusFilter;
  /** Máximo de filas a traer (vistas resumidas como el dashboard). */
  limit?: number;
}

/**
 * All orders (admin). Uses service role, bypasses RLS.
 * El filtro y el límite se aplican en la consulta, no en memoria.
 */
export async function getOrdersAdmin({
  status,
  limit,
}: GetOrdersAdminOptions = {}): Promise<Pedido[]> {
  return withNetworkFallback(async () => {
    const supabase = createServiceClient();
    let query = supabase
      .from("orders")
      .select(
        "id, user_id, status, payment_status, shipping_address, contact_email, total_cents, created_at",
      );
    if (status) query = applyOrderStatusFilter(query, status);
    let ordered = query.order("created_at", { ascending: false });
    if (limit !== undefined) ordered = ordered.limit(limit);
    const { data, error } = await ordered;
    if (error) throw toError(error);
    const rows = (data ?? []) as unknown as OrderRow[];
    const orderIds = rows.map((o) => o.id);
    const lineItemsByOrder: Record<string, PedidoLineItem[]> = {};
    if (orderIds.length > 0) {
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("order_id, quantity, product_snapshot")
        .in("order_id", orderIds);
      for (const row of (itemsData ?? []) as unknown as OrderItemRow[]) {
        const oid = row.order_id;
        if (!oid) continue;
        (lineItemsByOrder[oid] ??= []).push(rowToLineItem(row));
      }
    }
    return rows.map((r) => rowToPedido(r, lineItemsByOrder[r.id] ?? []));
  }, []);
}

/**
 * Nº de pedidos que coinciden con un estado. Cuenta en la BD (`head: true`, sin
 * traer filas) con el mismo predicado que `getOrdersAdmin`, así el contador y la
 * lista filtrada nunca se contradicen.
 */
export async function countOrdersAdmin(
  status: OrderStatusFilter,
): Promise<number> {
  return withNetworkFallback(async () => {
    const supabase = createServiceClient();
    const { count, error } = await applyOrderStatusFilter(
      supabase.from("orders").select("id", { count: "exact", head: true }),
      status,
    );
    if (error) throw toError(error);
    return count ?? 0;
  }, 0);
}

function coercePaymentStatus(
  value: string | null | undefined,
): OrderPaymentStatus {
  if (value === "paid" || value === "pending") return value;
  if (value === "failed" || value === "declined") return "declined";
  return "pending";
}

/**
 * Intenta transicionar un pedido a `payment_status = 'paid'` de forma atómica:
 * el UPDATE solo afecta filas que todavía NO estén pagadas, así que Postgres
 * serializa escrituras concurrentes sobre la misma fila y como mucho una gana.
 * Devuelve la fila si esta llamada hizo la transición, o `null` si el pedido
 * ya estaba pagado (doble clic del admin, confirmación repetida o carrera con
 * otra solicitud). Único punto de entrada al conteo del sorteo y al recibo de
 * compra (ver `markLinkedOrderAsPaid`).
 */
async function tryTransitionOrderToPaid(
  supabase: ReturnType<typeof createServiceClient>,
  orderId: string,
): Promise<{ id: string; total_cents: number } | null> {
  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .or("payment_status.is.null,payment_status.neq.paid")
    .select("id, total_cents")
    .maybeSingle();
  if (error) throw toError(error);
  return (data as { id: string; total_cents: number } | null) ?? null;
}

export interface OrderPaymentSucceededInput {
  orderId: string;
  /** Etiqueta legible de cómo se confirmó el cobro (p. ej. "Pago manual"). */
  paymentMethodLabel: string;
  /** Momento de confirmación del pago (ISO). */
  paidAtIso: string;
}

/**
 * Efectos posteriores a una compra confirmada: envía el recibo de compra.
 * Llamar solo cuando `markLinkedOrderAsPaid` devolvió una transición real —
 * así nunca se ejecuta dos veces para el mismo pedido. El envío del recibo
 * nunca revierte ni bloquea el flujo si falla.
 */
export async function onOrderPaymentSucceeded(
  input: OrderPaymentSucceededInput,
): Promise<void> {
  try {
    await sendOrderReceiptEmail(input);
  } catch (e) {
    console.error("[RECIBO] Error enviando el recibo de compra", {
      orderId: input.orderId,
      error: e,
    });
  }
}

/**
 * Marca como pagado un pedido tras un cambio manual de estado en el panel
 * admin (no hay pasarela: el cobro se coordina por WhatsApp). Devuelve `true`
 * si esta llamada realizó la transición (el llamador debe entonces invocar
 * `onOrderPaymentSucceeded`); `false` si el pedido ya estaba pagado.
 */
export async function markLinkedOrderAsPaid(orderId: string): Promise<boolean> {
  const supabase = createServiceClient();
  const row = await tryTransitionOrderToPaid(supabase, orderId);
  return row !== null;
}

/** Consulta pública: obtiene el estado de un pedido por ID (sin auth). Usa service role. */
export async function getOrderStatusById(
  orderId: string,
): Promise<OrderStatusDetail | null> {
  const raw = orderId?.trim().replace(/^#/, "") ?? "";
  if (!raw) return null;
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
  const isShort = /^[0-9a-f]{8}$/i.test(raw);
  if (!isUuid && !isShort) return null;
  try {
    const supabase = createServiceClient();
    const query = supabase
      .from("orders")
      .select(
        "id, status, total_cents, subtotal_cents, shipping_cents, coupon_discount_cents, created_at, shipping_address, contact_email, payment_status, paid_at, payment_method, bank_account_snapshot",
      );
    const { data: orderRows, error: orderError } = isUuid
      ? await query.eq("id", raw.toLowerCase()).limit(1)
      : await query
          .eq("order_number", raw.toUpperCase())
          .order("created_at", { ascending: false })
          .limit(1);

    const orderRow = orderRows?.[0];
    if (orderError || !orderRow) return null;
    const o = orderRow as unknown as {
      id: string;
      status: string;
      total_cents: number;
      created_at: string;
      shipping_address: ShippingAddress | null;
      contact_email: string | null;
      payment_status: string | null;
      paid_at: string | null;
      subtotal_cents: number;
      shipping_cents: number;
      coupon_discount_cents: number;
      payment_method: string | null;
      bank_account_snapshot: OrderStatusDetail["bankAccount"];
    };

    const { data: itemsData } = await supabase
      .from("order_items")
      .select("quantity, unit_price_cents, product_snapshot")
      .eq("order_id", o.id);

    type Snapshot = {
      name?: string;
      slug?: string;
      cover_image_url?: string;
      size?: string | null;
      color?: string | null;
    };
    type ItemRow = {
      quantity: number;
      unit_price_cents: number;
      product_snapshot?: Snapshot | null;
    };
    const items = ((itemsData ?? []) as unknown as ItemRow[]).map((row) => {
      const snap = row.product_snapshot ?? {};
      return {
        productName: snap.name ?? "Producto",
        productSlug: snap.slug ?? "",
        coverImageUrl: snap.cover_image_url ?? "",
        quantity: row.quantity,
        unitPriceCents: row.unit_price_cents,
        size: snap.size ?? null,
        color: snap.color ?? null,
      };
    });

    return {
      id: o.id,
      status: statusMap[o.status] ?? "pendiente",
      totalCents: o.total_cents,
      createdAt: formatDateTime(o.created_at, {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      shippingName: customerNameFromOrder(o.shipping_address, o.contact_email),
      items,
      paymentStatus: coercePaymentStatus(o.payment_status ?? undefined),
      paidAt: o.paid_at,
      rawStatus: o.status,
      paymentMethod: o.payment_method ?? "cash_on_delivery",
      paymentMethodLabel: paymentMethodLabel(o.payment_method),
      bankAccount: o.bank_account_snapshot ?? null,
      subtotalCents: o.subtotal_cents,
      shippingCents: o.shipping_cents,
      discountCents: o.coupon_discount_cents,
    };
  } catch {
    return null;
  }
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  minDays: number | null;
  maxDays: number | null;
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  return withNetworkFallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shipping_methods")
      .select("id, name, description, price_cents, min_days, max_days")
      .eq("is_active", true)
      .order("price_cents", { ascending: true });
    if (error) throw toError(error);
    return (data ?? []).map((row) => {
      const r = row as {
        id: string;
        name: string;
        description: string | null;
        price_cents: number;
        min_days: number | null;
        max_days: number | null;
      };
      return {
        id: r.id,
        name: r.name,
        description: r.description,
        priceCents: r.price_cents,
        minDays: r.min_days,
        maxDays: r.max_days,
      };
    });
  }, []);
}

