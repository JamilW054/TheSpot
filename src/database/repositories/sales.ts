import { paymentMethodLabel } from "@/database/repositories/payments";
import { ORDER_STATUS_LABEL } from "@/lib/orders/labels";
import {
  listDays,
  rangeToIso,
  rdDateKey,
  type SalesBasis,
} from "@/lib/sales-range";
import { createServiceClient } from "@/lib/supabase/server";

export interface SalesTotals {
  orders: number;
  units: number;
  /** Suma de líneas (precio × cantidad) antes de descuentos. */
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  /** Total cobrado al cliente (subtotal − descuento + envío). */
  totalCents: number;
  /** Costo de la mercancía vendida (costo unitario congelado × cantidad). */
  costCents: number;
  /** Ganancia bruta = subtotal − descuento − costo (sin envío). */
  profitCents: number;
  /** Margen sobre ventas netas de productos, en %. */
  marginPct: number;
  /** Ticket promedio (total / pedidos). */
  avgOrderCents: number;
  /** Pedidos cancelados en el periodo (informativo). */
  cancelledOrders: number;
  /** Pedidos aún sin cobrar en el periodo (informativo). */
  unpaidOrders: number;
  unpaidCents: number;
}

export interface SalesProductRow {
  key: string;
  productName: string;
  variant: string;
  units: number;
  revenueCents: number;
  costCents: number;
  profitCents: number;
}

export interface SalesOrderRow {
  id: string;
  number: string;
  createdAt: string;
  customer: string;
  phone: string | null;
  status: string;
  statusLabel: string;
  paid: boolean;
  paymentMethod: string;
  units: number;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  items: { name: string; variant: string; quantity: number; unitPriceCents: number }[];
}

export interface SalesReport {
  from: string;
  to: string;
  basis: SalesBasis;
  totals: SalesTotals;
  byProduct: SalesProductRow[];
  byPaymentMethod: { method: string; orders: number; totalCents: number }[];
  byDay: { day: string; orders: number; totalCents: number }[];
  orders: SalesOrderRow[];
}

type OrderRow = {
  id: string;
  order_number: string | null;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal_cents: number;
  coupon_discount_cents: number;
  discount_cents: number;
  shipping_cents: number;
  total_cents: number;
  shipping_address: { full_name?: string; phone?: string } | null;
  contact_email: string | null;
  order_items:
    | {
        quantity: number;
        unit_price_cents: number;
        unit_cost_cents: number | null;
        total_price_cents: number;
        size: string | null;
        color: string | null;
        product_snapshot: { name?: string } | null;
      }[]
    | null;
};

const VOID = new Set(["cancelled", "refunded"]);

const SALES_ORDER_SELECT =
  "id, order_number, created_at, status, payment_status, payment_method, subtotal_cents, coupon_discount_cents, discount_cents, shipping_cents, total_cents, shipping_address, contact_email, order_items(quantity, unit_price_cents, unit_cost_cents, total_price_cents, size, color, product_snapshot)";

export async function getSalesReport(opts: {
  from: string;
  to: string;
  basis: SalesBasis;
  /** Solo ventas de esta tienda (siempre en `/panel`). */
  storeId?: string | null;
}): Promise<SalesReport> {
  const { startIso, endIso } = rangeToIso(opts.from, opts.to);
  const supabase = createServiceClient();
  let base = supabase.from("orders");
  const { data, error } = await (opts.storeId
    ? base.select(SALES_ORDER_SELECT).eq("store_id", opts.storeId)
    : base.select(SALES_ORDER_SELECT))
    .gte("created_at", startIso)
    .lte("created_at", endIso)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw new Error(error.message);
  const all = (data ?? []) as unknown as OrderRow[];

  const totals: SalesTotals = {
    orders: 0,
    units: 0,
    subtotalCents: 0,
    discountCents: 0,
    shippingCents: 0,
    totalCents: 0,
    costCents: 0,
    profitCents: 0,
    marginPct: 0,
    avgOrderCents: 0,
    cancelledOrders: 0,
    unpaidOrders: 0,
    unpaidCents: 0,
  };
  const byProduct = new Map<string, SalesProductRow>();
  const byMethod = new Map<string, { orders: number; totalCents: number }>();
  const dayMap = new Map<string, { orders: number; totalCents: number }>();
  const orders: SalesOrderRow[] = [];

  for (const o of all) {
    if (VOID.has(o.status)) {
      totals.cancelledOrders += 1;
      continue;
    }
    const paid = o.payment_status === "paid";
    if (!paid) {
      totals.unpaidOrders += 1;
      totals.unpaidCents += o.total_cents;
    }
    if (opts.basis === "pagadas" && !paid) continue;

    const discount = (o.coupon_discount_cents ?? 0) + (o.discount_cents ?? 0);
    const items = o.order_items ?? [];
    let units = 0;
    for (const it of items) {
      units += it.quantity;
      const name = it.product_snapshot?.name ?? "Producto";
      const variant = [it.size, it.color].filter(Boolean).join(" · ") || "Única";
      const key = `${name}|${variant}`;
      const cost = (it.unit_cost_cents ?? 0) * it.quantity;
      const row =
        byProduct.get(key) ??
        { key, productName: name, variant, units: 0, revenueCents: 0, costCents: 0, profitCents: 0 };
      row.units += it.quantity;
      row.revenueCents += it.total_price_cents;
      row.costCents += cost;
      row.profitCents = row.revenueCents - row.costCents;
      byProduct.set(key, row);
      totals.costCents += cost;
    }

    totals.orders += 1;
    totals.units += units;
    totals.subtotalCents += o.subtotal_cents;
    totals.discountCents += discount;
    totals.shippingCents += o.shipping_cents;
    totals.totalCents += o.total_cents;

    const method = paymentMethodLabel(o.payment_method);
    const m = byMethod.get(method) ?? { orders: 0, totalCents: 0 };
    m.orders += 1;
    m.totalCents += o.total_cents;
    byMethod.set(method, m);

    const day = rdDateKey(o.created_at);
    const d = dayMap.get(day) ?? { orders: 0, totalCents: 0 };
    d.orders += 1;
    d.totalCents += o.total_cents;
    dayMap.set(day, d);

    orders.push({
      id: o.id,
      number: o.order_number ?? o.id.slice(0, 8).toUpperCase(),
      createdAt: o.created_at,
      customer: o.shipping_address?.full_name || o.contact_email || "Cliente",
      phone: o.shipping_address?.phone ?? null,
      status: o.status,
      statusLabel: ORDER_STATUS_LABEL[o.status] ?? o.status,
      paid,
      paymentMethod: method,
      units,
      subtotalCents: o.subtotal_cents,
      discountCents: discount,
      shippingCents: o.shipping_cents,
      totalCents: o.total_cents,
      items: items.map((it) => ({
        name: it.product_snapshot?.name ?? "Producto",
        variant: [it.size, it.color].filter(Boolean).join(" · "),
        quantity: it.quantity,
        unitPriceCents: it.unit_price_cents,
      })),
    });
  }

  const netProducts = totals.subtotalCents - totals.discountCents;
  totals.profitCents = netProducts - totals.costCents;
  totals.marginPct = netProducts > 0 ? (totals.profitCents / netProducts) * 100 : 0;
  totals.avgOrderCents = totals.orders > 0 ? Math.round(totals.totalCents / totals.orders) : 0;

  return {
    from: opts.from,
    to: opts.to,
    basis: opts.basis,
    totals,
    byProduct: [...byProduct.values()].sort(
      (a, b) => b.revenueCents - a.revenueCents || b.units - a.units,
    ),
    byPaymentMethod: [...byMethod.entries()]
      .map(([method, v]) => ({ method, ...v }))
      .sort((a, b) => b.totalCents - a.totalCents),
    byDay: listDays(opts.from, opts.to).map((day) => ({
      day,
      orders: dayMap.get(day)?.orders ?? 0,
      totalCents: dayMap.get(day)?.totalCents ?? 0,
    })),
    orders,
  };
}
