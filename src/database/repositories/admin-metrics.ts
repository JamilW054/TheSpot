/**
 * Métricas agregadas para el dashboard del admin.
 * Lecturas con service role (bypass RLS) desde Server Components.
 * Toda la agregación se hace en memoria sobre ventanas acotadas (180 días)
 * para mantener las consultas simples y el número de round-trips bajo.
 */

import { createServiceClient } from "@/lib/supabase/server";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Ventana de análisis para pedidos y ventas. */
const ORDERS_WINDOW_DAYS = 180;
/** Umbral de inventario bajo (unidades disponibles). */
export const LOW_STOCK_THRESHOLD = 5;

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  available: number;
}

export interface TopProduct {
  name: string;
  units: number;
  revenueCents: number;
}

export interface AdminDashboardMetrics {
  /** Ventas de hoy (pedidos creados hoy). */
  todayOrders: number;
  /** Ingresos de hoy (pedidos pagados creados hoy), en céntimos. */
  todayRevenueCents: number;
  /** Variación % de ingresos de hoy vs. ayer (null si ayer fue 0). */
  todayRevenueDeltaPct: number | null;
  /** Ingresos pagados en los últimos 30 días, en céntimos. */
  revenue30dCents: number;
  /** Pedidos pagados en los últimos 30 días. */
  paidOrders30d: number;
  /** Variación % vs. los 30 días anteriores (null si el periodo previo fue 0). */
  revenue30dDeltaPct: number | null;
  /** Pedidos pendientes de gestión. */
  pendingOrders: number;
  /** Pagos AZUL aprobados (histórico de la ventana). */
  azulApprovedPayments: number;
  /** Productos activos sin stock disponible. */
  outOfStockCount: number;
  /** Productos activos con inventario bajo (1–umbral). */
  lowStockCount: number;
  lowStockProducts: LowStockProduct[];
  /** Clientes registrados (perfiles no eliminados). */
  registeredCustomers: number;
  /** Producto más vendido por unidades en la ventana. */
  bestSeller: TopProduct | null;
  topProducts: TopProduct[];
  /** Ingresos pagados por día, últimos 30 días. */
  revenueSeries: SeriesPoint[];
  /** Pedidos por día, últimos 30 días. */
  ordersSeries: SeriesPoint[];
  /** Ingresos pagados por mes, últimos 6 meses. */
  monthlySeries: SeriesPoint[];
  /** Distribución de estado de pago de la ventana. */
  paymentStatus: { paid: number; pending: number; declined: number };
  /** Distribución de estado de gestión de la ventana. */
  orderStatus: { pendiente: number; enProceso: number; completado: number };
  /** Productos activos por categoría. */
  categoryDistribution: { name: string; value: number }[];
  /** Totales de catálogo. */
  catalog: { total: number; active: number; customizable: number };
  totalOrders: number;
}

interface MetricsOrderRow {
  id: string;
  status: string;
  payment_status: string | null;
  /** "AZUL_PAYMENT" | "PAYMENT_LINK" — ver PAYMENT_TYPE en lib/payments/status.ts. */
  payment_type: string | null;
  total_cents: number;
  created_at: string;
}

interface MetricsOrderItemRow {
  quantity: number;
  unit_price_cents: number | null;
  product_snapshot: { name?: string } | null;
  created_at: string;
}

interface MetricsProductRow {
  id: string;
  name: string;
  slug: string;
  is_active: boolean | null;
  is_customizable: boolean | null;
  category_id: string | null;
  categories: { name: string } | { name: string }[] | null;
  product_variants:
    | {
        is_active: boolean | null;
        inventory: { quantity: number; reserved: number }[] | null;
      }[]
    | null;
}

const dayLabel = new Intl.DateTimeFormat("es-DO", {
  day: "numeric",
  month: "short",
});
const monthLabel = new Intl.DateTimeFormat("es-DO", {
  month: "short",
  year: "2-digit",
});

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function deltaPct(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

function isPaid(o: MetricsOrderRow): boolean {
  return o.payment_status === "paid";
}

function isAzul(o: MetricsOrderRow): boolean {
  return o.payment_type === "AZUL_PAYMENT";
}

function categoryNameFromRow(row: MetricsProductRow): string | null {
  const c = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return c?.name ?? null;
}

/** Unidades disponibles de un producto (variantes activas, qty − reservado). */
function availableUnits(row: MetricsProductRow): number {
  let total = 0;
  for (const v of row.product_variants ?? []) {
    if (v.is_active === false) continue;
    for (const inv of v.inventory ?? []) {
      total += Math.max(0, (inv.quantity ?? 0) - (inv.reserved ?? 0));
    }
  }
  return total;
}

const EMPTY_METRICS: AdminDashboardMetrics = {
  todayOrders: 0,
  todayRevenueCents: 0,
  todayRevenueDeltaPct: null,
  revenue30dCents: 0,
  paidOrders30d: 0,
  revenue30dDeltaPct: null,
  pendingOrders: 0,
  azulApprovedPayments: 0,
  outOfStockCount: 0,
  lowStockCount: 0,
  lowStockProducts: [],
  registeredCustomers: 0,
  bestSeller: null,
  topProducts: [],
  revenueSeries: [],
  ordersSeries: [],
  monthlySeries: [],
  paymentStatus: { paid: 0, pending: 0, declined: 0 },
  orderStatus: { pendiente: 0, enProceso: 0, completado: 0 },
  categoryDistribution: [],
  catalog: { total: 0, active: 0, customizable: 0 },
  totalOrders: 0,
};

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  try {
    const supabase = createServiceClient();
    const windowStart = new Date(Date.now() - ORDERS_WINDOW_DAYS * DAY_MS);
    const windowIso = windowStart.toISOString();

    const [ordersRes, itemsRes, productsRes, profilesRes] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, status, payment_status, payment_type, total_cents, created_at",
        )
        .gte("created_at", windowIso)
        .order("created_at", { ascending: false }),
      supabase
        .from("order_items")
        .select("quantity, unit_price_cents, product_snapshot, created_at")
        .gte("created_at", windowIso),
      supabase
        .from("products")
        .select(
          "id, name, slug, is_active, is_customizable, category_id, categories(name), product_variants(is_active, inventory(quantity, reserved))",
        ),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null),
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (itemsRes.error) throw itemsRes.error;
    if (productsRes.error) throw productsRes.error;
    if (profilesRes.error) throw profilesRes.error;

    const orders = (ordersRes.data ?? []) as unknown as MetricsOrderRow[];
    const items = (itemsRes.data ?? []) as unknown as MetricsOrderItemRow[];
    const products = (productsRes.data ?? []) as unknown as MetricsProductRow[];
    const registeredCustomers = profilesRes.count ?? 0;

    const now = new Date();
    const todayStart = startOfDay(now).getTime();
    const yesterdayStart = todayStart - DAY_MS;
    const d30 = now.getTime() - 30 * DAY_MS;
    const d60 = now.getTime() - 60 * DAY_MS;

    /* ── Pedidos / ingresos ── */
    let todayOrders = 0;
    let todayRevenueCents = 0;
    let yesterdayRevenueCents = 0;
    let revenue30dCents = 0;
    let paidOrders30d = 0;
    let revenuePrev30dCents = 0;
    let pendingOrders = 0;
    let azulApprovedPayments = 0;
    const paymentStatus = { paid: 0, pending: 0, declined: 0 };
    const orderStatus = { pendiente: 0, enProceso: 0, completado: 0 };

    const revenueByDay = new Map<string, number>();
    const ordersByDay = new Map<string, number>();
    const revenueByMonth = new Map<string, number>();

    for (const o of orders) {
      const t = new Date(o.created_at).getTime();
      const created = new Date(o.created_at);
      const paid = isPaid(o);

      if (t >= todayStart) {
        todayOrders += 1;
        if (paid) todayRevenueCents += o.total_cents;
      } else if (t >= yesterdayStart && paid) {
        yesterdayRevenueCents += o.total_cents;
      }

      if (paid) {
        if (t >= d30) {
          revenue30dCents += o.total_cents;
          paidOrders30d += 1;
        } else if (t >= d60) revenuePrev30dCents += o.total_cents;
        revenueByMonth.set(
          monthKey(created),
          (revenueByMonth.get(monthKey(created)) ?? 0) + o.total_cents,
        );
        if (t >= d30) {
          revenueByDay.set(
            dayKey(created),
            (revenueByDay.get(dayKey(created)) ?? 0) + o.total_cents,
          );
        }
        if (isAzul(o)) azulApprovedPayments += 1;
      }

      if (t >= d30) {
        ordersByDay.set(
          dayKey(created),
          (ordersByDay.get(dayKey(created)) ?? 0) + 1,
        );
      }

      if (o.status === "pending") pendingOrders += 1;

      if (o.payment_status === "paid") paymentStatus.paid += 1;
      else if (o.payment_status === "declined" || o.payment_status === "failed")
        paymentStatus.declined += 1;
      else paymentStatus.pending += 1;

      if (
        o.status === "pending" ||
        o.status === "cancelled" ||
        o.status === "refunded"
      )
        orderStatus.pendiente += 1;
      else if (o.status === "confirmed" || o.status === "processing")
        orderStatus.enProceso += 1;
      else orderStatus.completado += 1;
    }

    /* ── Series diarias (30 días, huecos a 0) ── */
    const revenueSeries: SeriesPoint[] = [];
    const ordersSeries: SeriesPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = startOfDay(new Date(now.getTime() - i * DAY_MS));
      const label = dayLabel.format(d);
      revenueSeries.push({
        label,
        value: Math.round((revenueByDay.get(dayKey(d)) ?? 0) / 100),
      });
      ordersSeries.push({ label, value: ordersByDay.get(dayKey(d)) ?? 0 });
    }

    /* ── Serie mensual (6 meses) ── */
    const monthlySeries: SeriesPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlySeries.push({
        label: monthLabel.format(d),
        value: Math.round((revenueByMonth.get(monthKey(d)) ?? 0) / 100),
      });
    }

    /* ── Top productos por unidades ── */
    const byProduct = new Map<string, TopProduct>();
    for (const it of items) {
      const name = it.product_snapshot?.name?.trim() || "Producto";
      const entry = byProduct.get(name) ?? { name, units: 0, revenueCents: 0 };
      entry.units += it.quantity;
      entry.revenueCents += (it.unit_price_cents ?? 0) * it.quantity;
      byProduct.set(name, entry);
    }
    const topProducts = [...byProduct.values()]
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);
    const bestSeller = topProducts[0] ?? null;

    /* ── Inventario ── */
    let outOfStockCount = 0;
    const lowStockProducts: LowStockProduct[] = [];
    const categoryCount = new Map<string, number>();
    let activeCount = 0;
    let customizableCount = 0;
    for (const p of products) {
      if (p.is_customizable) customizableCount += 1;
      if (!p.is_active) continue;
      activeCount += 1;
      const cat = categoryNameFromRow(p);
      if (cat) categoryCount.set(cat, (categoryCount.get(cat) ?? 0) + 1);
      const available = availableUnits(p);
      if (available <= 0) outOfStockCount += 1;
      else if (available <= LOW_STOCK_THRESHOLD) {
        lowStockProducts.push({
          id: p.id,
          name: p.name,
          slug: p.slug,
          available,
        });
      }
    }
    lowStockProducts.sort((a, b) => a.available - b.available);

    const categoryDistribution = [...categoryCount.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      todayOrders,
      todayRevenueCents,
      todayRevenueDeltaPct: deltaPct(todayRevenueCents, yesterdayRevenueCents),
      revenue30dCents,
      paidOrders30d,
      revenue30dDeltaPct: deltaPct(revenue30dCents, revenuePrev30dCents),
      pendingOrders,
      azulApprovedPayments,
      outOfStockCount,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 6),
      registeredCustomers,
      bestSeller,
      topProducts,
      revenueSeries,
      ordersSeries,
      monthlySeries,
      paymentStatus,
      orderStatus,
      categoryDistribution,
      catalog: {
        total: products.length,
        active: activeCount,
        customizable: customizableCount,
      },
      totalOrders: orders.length,
    };
  } catch (error) {
    // El dashboard nunca debe tumbar el panel: sin datos ≠ error fatal.
    // Se registra igual — un fallo silencioso disfrazado de "sin datos" es
    // imposible de diagnosticar.
    console.error(
      "[admin-metrics] Error calculando métricas del dashboard",
      error,
    );
    return EMPTY_METRICS;
  }
}
