import {
  type PaymentStatus,
  type PaymentType,
  paymentTypeFromMethodCode,
} from "@/lib/payments/status";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * Lecturas del módulo de pagos para el cliente (respetan RLS: solo sus filas).
 * El panel admin usa `paymentRequestsRepo` / `paymentMethodsRepo` con la service
 * role. Mantener los `select` alineados con la migración 00016.
 */

export interface PaymentMethodOption {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isDisabled: boolean;
  badgeLabel: string | null;
}

export interface PaymentStatusEvent {
  id: string;
  previousStatus: PaymentStatus | null;
  newStatus: PaymentStatus;
  note: string | null;
  createdAt: string;
}

/** Línea de producto para la vista previa del pago (desde order_items). */
export interface PaymentLineItem {
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export interface CustomerPaymentRequest {
  id: string;
  referenceNumber: string;
  amountCents: number;
  currency: string;
  description: string | null;
  status: PaymentStatus;
  paymentUrl: string | null;
  methodName: string;
  methodCode: string;
  paymentType: PaymentType;
  orderId: string | null;
  items: PaymentLineItem[];
  sentAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  history: PaymentStatusEvent[];
}

const METHOD_COLS =
  "id, code, name, description, is_active, is_disabled, badge_label, sort_order";

const REQUEST_COLS =
  "id, order_id, reference_number, amount_cents, currency, description, status, payment_url, sent_at, paid_at, created_at, updated_at, payment_methods(name, code), payment_status_history(id, previous_status, new_status, note, created_at)";

/** Métodos de pago visibles (incluye los deshabilitados, ordenados). */
export async function getPaymentMethods(): Promise<PaymentMethodOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .select(METHOD_COLS)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []).map((m: Record<string, unknown>) => ({
    id: m.id as string,
    code: m.code as string,
    name: m.name as string,
    description: (m.description as string | null) ?? null,
    isActive: Boolean(m.is_active),
    isDisabled: Boolean(m.is_disabled),
    badgeLabel: (m.badge_label as string | null) ?? null,
  }));
}

/** Solicitudes de pago del usuario autenticado, con su historial de estados. */
export async function getMyPaymentRequests(): Promise<
  CustomerPaymentRequest[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("payment_requests")
    .select(REQUEST_COLS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  const rows = data as Record<string, unknown>[];

  // Vista previa de productos: las líneas viven en order_items (vía order_id).
  // La propiedad ya está garantizada por RLS (solo vemos nuestras solicitudes),
  // así que las líneas se leen con la service role en un único lote.
  const orderIds = [
    ...new Set(
      rows
        .map((r) => r.order_id as string | null)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const itemsByOrder = await getOrderLineItems(orderIds);

  return rows.map((row) => mapRequestRow(row, itemsByOrder));
}

/** order_items agrupados por order_id, mapeados a líneas de vista previa. */
async function getOrderLineItems(
  orderIds: string[],
): Promise<Map<string, PaymentLineItem[]>> {
  const byOrder = new Map<string, PaymentLineItem[]>();
  if (orderIds.length === 0) return byOrder;

  const service = createServiceClient();
  // order_items no tiene columna created_at: ordenar por ella hace que PostgREST
  // devuelva error 42703 y `data` quede null → la vista previa se queda vacía.
  // El orden de inserción (lote del checkout) basta, así que no se ordena.
  const { data } = await service
    .from("order_items")
    .select(
      "order_id, quantity, unit_price_cents, total_price_cents, product_snapshot",
    )
    .in("order_id", orderIds);

  for (const raw of (data ?? []) as Record<string, unknown>[]) {
    const orderId = raw.order_id as string;
    const snap = (raw.product_snapshot ?? {}) as {
      name?: string;
      cover_image_url?: string;
    };
    const quantity = (raw.quantity as number) ?? 1;
    const unitPriceCents = (raw.unit_price_cents as number) ?? 0;
    const totalCents =
      (raw.total_price_cents as number | null) ?? unitPriceCents * quantity;
    const item: PaymentLineItem = {
      name: snap.name ?? "Producto",
      imageUrl: snap.cover_image_url ?? null,
      quantity,
      unitPriceCents,
      totalCents,
    };
    const list = byOrder.get(orderId) ?? [];
    list.push(item);
    byOrder.set(orderId, list);
  }
  return byOrder;
}

// ---------------------------------------------------------------------------
// Admin (service role): listado del panel de gestión de pagos
// ---------------------------------------------------------------------------

export interface AdminPaymentRequest {
  id: string;
  referenceNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string | null;
  customerUsername: string | null;
  customerPhone: string | null;
  customerAvatarUrl: string | null;
  customerSince: string | null;
  amountCents: number;
  currency: string;
  description: string | null;
  methodName: string;
  paymentType: PaymentType;
  status: PaymentStatus;
  paymentUrl: string | null;
  createdAt: string;
  sentAt: string | null;
  paidAt: string | null;
  updatedAt: string;
  emailDeliveryStatus: string | null;
}

const ADMIN_REQUEST_COLS =
  "id, user_id, reference_number, amount_cents, currency, description, payment_url, status, created_at, sent_at, paid_at, updated_at, payment_methods!inner(name, code), email_logs(recipient_email, delivery_status, sent_at)";

/**
 * Solicitudes de pago para el panel admin (Gestión de pagos). Solo enlaces de
 * pago (PAYMENT_LINK): los cobros de Azul los controla la API de Azul y no se
 * gestionan manualmente aquí.
 */
export async function getAdminPaymentRequests(): Promise<
  AdminPaymentRequest[]
> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("payment_requests")
    .select(ADMIN_REQUEST_COLS)
    .eq("payment_methods.code", "payment_link")
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  const rows = data as Record<string, unknown>[];

  // Ficha del cliente desde profiles (user_id → profiles.id). El correo vive en
  // profiles.email (lo escribe la app al registrarse).
  const userIds = [...new Set(rows.map((r) => r.user_id as string))];
  const profilesById = new Map<string, Record<string, string | null>>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, username, phone, avatar_url, created_at, email")
      .in("id", userIds);
    for (const p of (profiles ?? []) as Record<string, string | null>[]) {
      profilesById.set(p.id as string, p);
    }
  }

  return rows.map((row) => {
    const method = (row.payment_methods ?? {}) as {
      name?: string;
      code?: string;
    };
    const logs = (row.email_logs ?? []) as Record<string, unknown>[];
    const latestLog = logs
      .slice()
      .sort((a, b) =>
        String(b.sent_at ?? "").localeCompare(String(a.sent_at ?? "")),
      )[0];
    const userId = row.user_id as string;
    const profile = profilesById.get(userId);
    return {
      id: row.id as string,
      referenceNumber: row.reference_number as string,
      userId,
      customerName:
        profile?.full_name ?? profile?.username ?? "Cliente",
      customerEmail:
        profile?.email ??
        (latestLog?.recipient_email as string | null) ??
        null,
      customerUsername: profile?.username ?? null,
      customerPhone: profile?.phone ?? null,
      customerAvatarUrl: profile?.avatar_url ?? null,
      customerSince: profile?.created_at ?? null,
      amountCents: (row.amount_cents as number) ?? 0,
      currency: (row.currency as string) ?? "DOP",
      description: (row.description as string | null) ?? null,
      methodName: method.name ?? "Payment Link",
      paymentType: paymentTypeFromMethodCode(method.code ?? "payment_link"),
      status: row.status as PaymentStatus,
      paymentUrl: (row.payment_url as string | null) ?? null,
      createdAt: row.created_at as string,
      sentAt: (row.sent_at as string | null) ?? null,
      paidAt: (row.paid_at as string | null) ?? null,
      updatedAt: row.updated_at as string,
      emailDeliveryStatus:
        (latestLog?.delivery_status as string | null) ?? null,
    };
  });
}

function mapRequestRow(
  row: Record<string, unknown>,
  itemsByOrder: Map<string, PaymentLineItem[]>,
): CustomerPaymentRequest {
  const method = (row.payment_methods ?? {}) as {
    name?: string;
    code?: string;
  };
  const methodCode = method.code ?? "payment_link";
  const orderId = (row.order_id as string | null) ?? null;
  const historyRows = (row.payment_status_history ?? []) as Record<
    string,
    unknown
  >[];
  const history: PaymentStatusEvent[] = historyRows
    .map((h) => ({
      id: h.id as string,
      previousStatus: (h.previous_status as PaymentStatus | null) ?? null,
      newStatus: h.new_status as PaymentStatus,
      note: (h.note as string | null) ?? null,
      createdAt: h.created_at as string,
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    id: row.id as string,
    referenceNumber: row.reference_number as string,
    amountCents: (row.amount_cents as number) ?? 0,
    currency: (row.currency as string) ?? "DOP",
    description: (row.description as string | null) ?? null,
    status: row.status as PaymentStatus,
    paymentUrl: (row.payment_url as string | null) ?? null,
    methodName: method.name ?? "Payment Link",
    methodCode,
    paymentType: paymentTypeFromMethodCode(methodCode),
    orderId,
    items: orderId ? (itemsByOrder.get(orderId) ?? []) : [],
    sentAt: (row.sent_at as string | null) ?? null,
    paidAt: (row.paid_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    history,
  };
}
