import { sendCompraEmail } from "@/lib/resend";
import type { OrderItem } from "@/lib/resend/templates/compra";
import { formatDateTime } from "@/lib/format-date";
import { isSuccessfulPaymentStatus } from "@/lib/orders/payment-status";
import { createServiceClient } from "@/lib/supabase/server";
import { customerNameFromOrder, type ShippingAddress } from "./orders";

export interface OrderReceiptInput {
  orderId: string;
  paymentMethodLabel: string;
  /** Fecha de confirmación del pago (ISO), ya conocida por el llamador. */
  paidAtIso: string;
}

interface ReceiptOrderRow {
  contact_email: string | null;
  shipping_address: ShippingAddress | null;
  subtotal_cents: number | null;
  tax_cents: number | null;
  shipping_cents: number | null;
  total_cents: number;
  payment_status: string | null;
}

interface ReceiptItemRow {
  quantity: number;
  unit_price_cents: number;
  product_snapshot: {
    name?: string;
    size?: string | null;
    color?: string | null;
    cover_image_url?: string | null;
  } | null;
}

/**
 * Envía el recibo de compra por correo una única vez por pedido, sin importar
 * cuántas veces se confirme el pago (webhooks/confirmaciones duplicadas). La
 * idempotencia la da el índice único parcial
 * `email_logs(order_id) WHERE email_type = 'receipt'` (migración 00022): si la
 * reserva del envío choca con una fila existente, ya se envió o se está
 * enviando y esta llamada no hace nada.
 *
 * Se llama desde `onOrderPaymentSucceeded` (lib/db/index.ts) justo después de
 * que la transición a "paid" ocurrió de forma atómica, así que en el camino
 * feliz nunca compite consigo misma; la reserva es la red de seguridad para
 * cualquier otra carrera.
 */
export async function sendOrderReceiptEmail(
  input: OrderReceiptInput,
): Promise<void> {
  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "contact_email, shipping_address, subtotal_cents, tax_cents, shipping_cents, total_cents, payment_status",
    )
    .eq("id", input.orderId)
    .maybeSingle();
  const row = order as ReceiptOrderRow | null;
  if (!row || !isSuccessfulPaymentStatus(row.payment_status)) return;

  const email = row.contact_email ?? row.shipping_address?.email ?? null;
  if (!email) return;

  const { error: reserveErr } = await supabase.from("email_logs").insert({
    order_id: input.orderId,
    recipient_email: email,
    email_type: "receipt",
    delivery_status: "pending",
  });
  if (reserveErr) {
    if ((reserveErr as { code?: string }).code !== "23505") {
      console.error("[RECIBO] No se pudo reservar el envío", {
        orderId: input.orderId,
        error: reserveErr,
      });
    }
    return; // 23505: ya hay un recibo reservado/enviado para este pedido.
  }

  const { data: itemRows } = await supabase
    .from("order_items")
    .select("quantity, unit_price_cents, product_snapshot")
    .eq("order_id", input.orderId);

  const items: OrderItem[] = ((itemRows ?? []) as ReceiptItemRow[]).map((i) => {
    const snap = i.product_snapshot ?? {};
    return {
      name: snap.name ?? "Producto",
      quantity: i.quantity,
      size: snap.size ?? undefined,
      color: snap.color ?? undefined,
      unitPrice: i.unit_price_cents,
      imageUrl: snap.cover_image_url ?? null,
    };
  });

  let deliveryStatus = "sent";
  let providerResponse: unknown = null;
  try {
    const res = await sendCompraEmail(email, {
      name: customerNameFromOrder(row.shipping_address, row.contact_email),
      orderId: input.orderId,
      orderNumber: input.orderId.slice(0, 8).toUpperCase(),
      items,
      subtotal: row.subtotal_cents ?? row.total_cents,
      shipping: row.shipping_cents ?? 0,
      tax: row.tax_cents ?? 0,
      total: row.total_cents,
      currency: "DOP",
      purchaseDate: formatDateTime(input.paidAtIso, {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      paymentMethodLabel: input.paymentMethodLabel,
      paymentStatusLabel: "Pagado",
    });
    providerResponse = res;
    if ((res as { error?: unknown })?.error) deliveryStatus = "failed";
  } catch (e) {
    deliveryStatus = "failed";
    providerResponse = { message: e instanceof Error ? e.message : String(e) };
  }

  await supabase
    .from("email_logs")
    .update({
      delivery_status: deliveryStatus,
      provider_response: providerResponse,
      sent_at: new Date().toISOString(),
    })
    .eq("order_id", input.orderId)
    .eq("email_type", "receipt");

  if (deliveryStatus === "failed") {
    console.error("[RECIBO] Envío falló", { orderId: input.orderId });
  }
}
