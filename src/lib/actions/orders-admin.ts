"use server";

import { revalidatePath } from "next/cache";
import { onOrderPaymentSucceeded } from "@/database/repositories";
import { paymentMethodLabel } from "@/database/repositories/payments";
import { assertRowAccess, requireStoreActor } from "@/lib/auth/store-actor";
import {
  inventoryEffect,
  isOrderStatus,
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from "@/lib/orders/labels";
import type { OrderStatusFilter } from "@/lib/orders/status";
import { createServiceClient } from "@/lib/supabase/server";

type ServiceClient = ReturnType<typeof createServiceClient>;

/**
 * Estados de fulfillment de las acciones en lote de la lista de pedidos.
 * `paid` marca el cobro; el resto son estados reales de `orders.status`.
 */
export type OrderFulfillmentStatus = OrderStatusFilter | "shipped";

function revalidateOrders(orderId?: string) {
  for (const base of ["/admin", "/panel"]) {
    revalidatePath(`${base}/pedidos`);
    revalidatePath(base);
    revalidatePath(`${base}/inventario`);
    revalidatePath(`${base}/ventas`);
    if (orderId) revalidatePath(`${base}/pedidos/${orderId}`);
  }
}

/** Actor con acceso al pedido (admin: todos; tienda: solo los suyos). */
async function authorizeOrder(orderId: string): Promise<{ userId: string }> {
  const actor = await requireStoreActor();
  await assertRowAccess(actor, "orders", orderId);
  return { userId: actor.userId };
}

// ---------------------------------------------------------------------------
// Inventario
// ---------------------------------------------------------------------------

/**
 * Aplica al inventario la diferencia entre el efecto del estado anterior y el
 * nuevo (ver `inventoryEffect`): reservar al abrir, descontar al entregar,
 * liberar/reponer al cancelar. Una sola bodega: se ajusta la fila de
 * inventario con más existencia de cada variante.
 */
async function applyInventoryTransition(
  supabase: ServiceClient,
  orderId: string,
  prevStatus: string,
  nextStatus: string,
): Promise<void> {
  if (prevStatus === nextStatus) return;
  const { data: items } = await supabase
    .from("order_items")
    .select("variant_id, quantity")
    .eq("order_id", orderId);
  const byVariant = new Map<string, number>();
  for (const it of (items ?? []) as {
    variant_id: string | null;
    quantity: number;
  }[]) {
    if (!it.variant_id) continue;
    byVariant.set(
      it.variant_id,
      (byVariant.get(it.variant_id) ?? 0) + it.quantity,
    );
  }
  for (const [variantId, n] of byVariant) {
    const before = inventoryEffect(prevStatus, n);
    const after = inventoryEffect(nextStatus, n);
    const dReserved = after.reserved - before.reserved;
    const dQuantity = after.quantity - before.quantity;
    if (dReserved === 0 && dQuantity === 0) continue;
    const { data } = await supabase
      .from("inventory")
      .select("id, quantity, reserved")
      .eq("variant_id", variantId)
      .is("deleted_at", null)
      .order("quantity", { ascending: false })
      .limit(1);
    const row = (data ?? [])[0] as
      | { id: string; quantity: number; reserved: number }
      | undefined;
    if (!row) continue; // Variante sin stock rastreado.
    await supabase
      .from("inventory")
      .update({
        quantity: Math.max(0, row.quantity + dQuantity),
        reserved: Math.max(0, row.reserved + dReserved),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  }
}

// ---------------------------------------------------------------------------
// Estado y pago de un pedido
// ---------------------------------------------------------------------------

interface OrderCore {
  id: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
}

async function loadOrder(
  supabase: ServiceClient,
  orderId: string,
): Promise<OrderCore> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, payment_status, payment_method")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Pedido no encontrado.");
  return data as OrderCore;
}

async function markPaid(
  supabase: ServiceClient,
  order: OrderCore,
  userId: string,
): Promise<void> {
  if (order.payment_status === "paid") return;
  const paidAtIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      paid_at: paidAtIso,
      updated_at: paidAtIso,
    })
    .eq("id", order.id)
    .neq("payment_status", "paid")
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return; // Otra acción concurrente ya lo marcó.
  await supabase.from("order_status_history").insert({
    order_id: order.id,
    status: order.status,
    changed_by: userId,
    note: "Pago confirmado",
  });
  // Recibo al cliente (best-effort, nunca bloquea).
  await onOrderPaymentSucceeded({
    orderId: order.id,
    paymentMethodLabel: paymentMethodLabel(order.payment_method),
    paidAtIso,
  });
}

async function setStatus(
  supabase: ServiceClient,
  order: OrderCore,
  next: OrderStatus,
  userId: string,
  note?: string | null,
): Promise<void> {
  if (order.status === next) return;
  const { error } = await supabase
    .from("orders")
    .update({ status: next, updated_at: new Date().toISOString() })
    .eq("id", order.id);
  if (error) throw new Error(error.message);
  await applyInventoryTransition(supabase, order.id, order.status, next);
  await supabase.from("order_status_history").insert({
    order_id: order.id,
    status: next,
    changed_by: userId,
    note:
      note?.trim() ||
      `${ORDER_STATUS_LABEL[order.status] ?? order.status} → ${ORDER_STATUS_LABEL[next]}`,
  });
  // Contra entrega: al entregar, el cobro se hizo en la puerta.
  if (
    next === "delivered" &&
    order.payment_method === "cash_on_delivery" &&
    order.payment_status !== "paid"
  ) {
    await markPaid(supabase, { ...order, status: next }, userId);
  }
}

export type OrderActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): OrderActionResult {
  return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
}

/** Cambia el estado de un pedido (cualquiera de los 7 estados reales). */
export async function adminSetOrderStatus(
  orderId: string,
  status: string,
  note?: string | null,
): Promise<OrderActionResult> {
  try {
    const { userId } = await authorizeOrder(orderId);
    if (!isOrderStatus(status)) throw new Error("Estado no válido.");
    const supabase = createServiceClient();
    const order = await loadOrder(supabase, orderId);
    await setStatus(supabase, order, status, userId, note);
    revalidateOrders(orderId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Marca un pedido como pagado o lo devuelve a pendiente de pago. */
export async function adminSetOrderPaid(
  orderId: string,
  paid: boolean,
): Promise<OrderActionResult> {
  try {
    const { userId } = await authorizeOrder(orderId);
    const supabase = createServiceClient();
    const order = await loadOrder(supabase, orderId);
    if (paid) {
      await markPaid(supabase, order, userId);
      // Un pedido pendiente que se cobra pasa a confirmado.
      if (order.status === "pending") {
        await setStatus(supabase, order, "confirmed", userId, "Confirmado al recibir el pago");
      }
    } else if (order.payment_status === "paid") {
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "pending",
          paid_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
      if (error) throw new Error(error.message);
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status: order.status,
        changed_by: userId,
        note: "Pago marcado como pendiente",
      });
    }
    revalidateOrders(orderId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Notas internas del pedido (no las ve el cliente). */
export async function adminUpdateOrderNotes(
  orderId: string,
  adminNotes: string,
): Promise<OrderActionResult> {
  try {
    await authorizeOrder(orderId);
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("orders")
      .update({
        admin_notes: adminNotes.trim().slice(0, 2000) || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    if (error) throw new Error(error.message);
    revalidateOrders(orderId);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Acciones en lote de la lista de pedidos. */
export async function adminSetOrdersStatus(
  ids: string[],
  status: OrderFulfillmentStatus,
): Promise<void> {
  const actor = await requireStoreActor();
  const userId = actor.userId;
  const unique = [...new Set(ids.map((x) => x.trim()).filter(Boolean))];
  if (unique.length === 0) return;
  const supabase = createServiceClient();
  for (const id of unique) {
    await assertRowAccess(actor, "orders", id);
    const order = await loadOrder(supabase, id);
    if (status === "paid") {
      await markPaid(supabase, order, userId);
      if (order.status === "pending") {
        await setStatus(supabase, order, "confirmed", userId, "Confirmado al recibir el pago");
      }
    } else if (status === "shipped" || status === "cancelled") {
      await setStatus(supabase, order, status, userId);
    } else {
      await setStatus(supabase, order, "pending", userId);
    }
  }
  revalidateOrders();
}

export async function adminDeleteOrder(id: string): Promise<void> {
  const orderId = id.trim();
  const { userId } = await authorizeOrder(orderId);
  const supabase = createServiceClient();
  const order = await loadOrder(supabase, orderId);
  // Libera la reserva (o repone si estaba entregado) antes de borrar.
  await setStatus(supabase, order, "cancelled", userId, "Pedido eliminado");
  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidateOrders();
}
