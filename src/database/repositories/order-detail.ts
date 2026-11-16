import type { ShippingAddress } from "@/database/repositories/orders";
import {
  type BankAccountSnapshot,
  paymentMethodLabel,
} from "@/database/repositories/payments";
import type { CompraEmailData } from "@/lib/resend/templates/compra";
import { createServiceClient } from "@/lib/supabase/server";

export interface OrderDetailItem {
  id: string;
  productName: string;
  productSlug: string | null;
  coverImage: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  unitPriceCents: number;
  unitCostCents: number;
  totalCents: number;
  sku: string | null;
}

export interface OrderHistoryEntry {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
  byAdmin: boolean;
}

export interface OrderAdminDetail {
  id: string;
  number: string;
  /** Tienda que gestiona el pedido. */
  storeId: string | null;
  storeName: string | null;
  /** Compra (checkout) a la que pertenece, con su número. */
  checkoutNumber: string | null;
  status: string;
  paymentStatus: string;
  paidAt: string | null;
  paymentMethod: string;
  paymentMethodLabel: string;
  bankAccount: BankAccountSnapshot | null;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  email: string | null;
  phone: string | null;
  address: ShippingAddress | null;
  notes: string | null;
  adminNotes: string | null;
  couponCode: string | null;
  shippingMethodName: string | null;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  costCents: number;
  items: OrderDetailItem[];
  history: OrderHistoryEntry[];
}

type Row = {
  id: string;
  order_number: string | null;
  store_id: string | null;
  stores: { name: string } | { name: string }[] | null;
  checkouts: { checkout_number: string } | { checkout_number: string }[] | null;
  status: string;
  payment_status: string;
  paid_at: string | null;
  payment_method: string | null;
  bank_account_snapshot: BankAccountSnapshot | null;
  created_at: string;
  updated_at: string;
  contact_email: string | null;
  shipping_address: ShippingAddress | null;
  notes: string | null;
  admin_notes: string | null;
  subtotal_cents: number;
  coupon_discount_cents: number;
  discount_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  coupons: { code: string } | { code: string }[] | null;
  shipping_methods: { name: string } | { name: string }[] | null;
  order_items:
    | {
        id: string;
        quantity: number;
        unit_price_cents: number;
        unit_cost_cents: number | null;
        total_price_cents: number;
        size: string | null;
        color: string | null;
        product_snapshot: {
          name?: string;
          slug?: string;
          cover_image_url?: string;
        } | null;
        product_variants: { sku: string | null } | { sku: string | null }[] | null;
      }[]
    | null;
  order_status_history:
    | {
        id: string;
        status: string;
        note: string | null;
        created_at: string;
        changed_by: string | null;
      }[]
    | null;
};

const one = <T,>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

export async function getOrderAdminDetail(
  orderId: string,
): Promise<OrderAdminDetail | null> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, store_id, stores(name), checkouts(checkout_number), status, payment_status, paid_at, payment_method, bank_account_snapshot, created_at, updated_at, contact_email, shipping_address, notes, admin_notes, subtotal_cents, coupon_discount_cents, discount_cents, shipping_cents, tax_cents, total_cents, coupons(code), shipping_methods(name), order_items(id, quantity, unit_price_cents, unit_cost_cents, total_price_cents, size, color, product_snapshot, product_variants(sku)), order_status_history(id, status, note, created_at, changed_by)",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const o = data as unknown as Row;
  const addr = o.shipping_address;
  const items: OrderDetailItem[] = (o.order_items ?? []).map((it) => ({
    id: it.id,
    productName: it.product_snapshot?.name ?? "Producto",
    productSlug: it.product_snapshot?.slug ?? null,
    coverImage: it.product_snapshot?.cover_image_url || null,
    size: it.size,
    color: it.color,
    quantity: it.quantity,
    unitPriceCents: it.unit_price_cents,
    unitCostCents: it.unit_cost_cents ?? 0,
    totalCents: it.total_price_cents,
    sku: one(it.product_variants)?.sku ?? null,
  }));
  return {
    id: o.id,
    number: o.order_number ?? o.id.slice(0, 8).toUpperCase(),
    storeId: o.store_id ?? null,
    storeName: one(o.stores)?.name ?? null,
    checkoutNumber: one(o.checkouts)?.checkout_number ?? null,
    status: o.status,
    paymentStatus: o.payment_status,
    paidAt: o.paid_at,
    paymentMethod: o.payment_method ?? "cash_on_delivery",
    paymentMethodLabel: paymentMethodLabel(o.payment_method),
    bankAccount: o.bank_account_snapshot,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    customerName: addr?.full_name || o.contact_email || "Cliente",
    email: o.contact_email ?? addr?.email ?? null,
    phone: addr?.phone ?? null,
    address: addr,
    notes: o.notes,
    adminNotes: o.admin_notes,
    couponCode: one(o.coupons)?.code ?? null,
    shippingMethodName: one(o.shipping_methods)?.name ?? null,
    subtotalCents: o.subtotal_cents,
    discountCents: (o.coupon_discount_cents ?? 0) + (o.discount_cents ?? 0),
    shippingCents: o.shipping_cents,
    taxCents: o.tax_cents,
    totalCents: o.total_cents,
    costCents: items.reduce((s, i) => s + i.unitCostCents * i.quantity, 0),
    items,
    history: (o.order_status_history ?? [])
      .map((h) => ({
        id: h.id,
        status: h.status,
        note: h.note,
        createdAt: h.created_at,
        byAdmin: Boolean(h.changed_by),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

/** Datos para el PDF de comprobante del pedido (mismo formato que el recibo). */
export function orderToReceiptData(o: OrderAdminDetail): CompraEmailData {
  return {
    name: o.customerName,
    orderId: o.id,
    orderNumber: o.number,
    items: o.items.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      size: i.size ?? undefined,
      color: i.color ?? undefined,
      unitPrice: i.unitPriceCents,
      imageUrl: null,
    })),
    subtotal: o.subtotalCents - o.discountCents,
    shipping: o.shippingCents,
    tax: o.taxCents,
    total: o.totalCents,
    currency: "DOP",
    purchaseDate: new Date(o.createdAt).toLocaleString("es-DO", {
      timeZone: "America/Santo_Domingo",
      dateStyle: "long",
      timeStyle: "short",
    }),
    paymentMethodLabel: o.paymentMethodLabel,
    paymentStatusLabel: o.paymentStatus === "paid" ? "Pagado" : "Pendiente de pago",
  };
}
