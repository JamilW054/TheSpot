"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { markLinkedOrderAsPaid, onOrderPaymentSucceeded } from "@/database/repositories";
import { paymentTypeMeta } from "@/lib/payments/status";
import { createServiceClient } from "@/lib/supabase/server";

export type OrderFulfillmentStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "cancelled";

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
    // Transición atómica por pedido — mismo mecanismo que usan el retorno de
    // Azul y el panel de Payment Link (`markLinkedOrderAsPaid`). Si el admin
    // repite la acción sobre un pedido que ya estaba pagado, esta llamada no
    // hace nada: no se recuenta para el sorteo ni se reenvía el recibo.
    for (const orderId of unique) {
      if (await markLinkedOrderAsPaid(orderId)) {
        const { data: order } = await supabase
          .from("orders")
          .select("payment_type")
          .eq("id", orderId)
          .maybeSingle();
        await onOrderPaymentSucceeded({
          orderId,
          paymentMethodLabel: paymentTypeMeta(
            (order?.payment_type as string | null) ?? null,
          ).label,
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
  revalidatePath("/admin/facturas");
  revalidatePath("/admin");
}

export async function adminDeleteOrder(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("orders").delete().eq("id", id.trim());
  if (error) throw new Error(error.message);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/facturas");
  revalidatePath("/admin");
}
