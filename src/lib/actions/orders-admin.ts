"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { markLinkedOrderAsPaid, onOrderPaymentSucceeded } from "@/database/repositories";
import type { OrderStatusFilter } from "@/lib/orders/status";
import { createServiceClient } from "@/lib/supabase/server";

/** Etiqueta genérica para el recibo: no hay pasarela, el cobro lo confirma el admin. */
const MANUAL_PAYMENT_METHOD_LABEL = "Pago confirmado por el negocio";

/**
 * Estados de fulfillment gestionables desde el panel. Los tres filtrables en
 * "Todos los pedidos" viven en `lib/orders/status` (fuente única) y aquí se
 * suma `shipped`, que solo se usa como acción en lote.
 */
export type OrderFulfillmentStatus = OrderStatusFilter | "shipped";

/**
 * Traduce el estado de fulfillment de la UI a las columnas reales del pedido.
 * `order_status` no incluye 'paid'; ese caso marca el pago y confirma el pedido.
 */
function mapFulfillment(status: OrderFulfillmentStatus): {
  status: string;
  payment_status?: string;
} {
  switch (status) {
    case "paid":
      return { status: "confirmed", payment_status: "paid" };
    case "shipped":
      return { status: "shipped" };
    case "cancelled":
      return { status: "cancelled" };
    default:
      return { status: "pending" };
  }
}

export async function adminSetOrdersStatus(
  ids: string[],
  status: OrderFulfillmentStatus,
): Promise<void> {
  const { userId } = await requireAdmin();
  const unique = [...new Set(ids.map((x) => x.trim()).filter(Boolean))];
  if (unique.length === 0) return;
  const supabase = createServiceClient();
  const patch = mapFulfillment(status);

  if (status === "paid") {
    // Transición atómica por pedido: marca el pedido como cobrado a mano
    // (no hay pasarela). Si el admin repite la acción sobre un pedido que ya
    // estaba pagado, esta llamada no hace nada: no se reenvía el recibo.
    for (const orderId of unique) {
      if (await markLinkedOrderAsPaid(orderId)) {
        await onOrderPaymentSucceeded({
          orderId,
          paymentMethodLabel: MANUAL_PAYMENT_METHOD_LABEL,
          paidAtIso: new Date().toISOString(),
        });
      }
    }
  } else {
    const { error } = await supabase
      .from("orders")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .in("id", unique);
    if (error) throw new Error(error.message);
  }

  // Registrar el cambio en el historial de cada pedido.
  await supabase.from("order_status_history").insert(
    unique.map((order_id) => ({
      order_id,
      status: patch.status,
      changed_by: userId,
    })),
  );

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}

export async function adminDeleteOrder(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("orders").delete().eq("id", id.trim());
  if (error) throw new Error(error.message);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}
