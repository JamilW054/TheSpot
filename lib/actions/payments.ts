"use server";

import { revalidatePath } from "next/cache";
import { formatDOPFromCents } from "@/lib/format-currency";
import { PAYMENT_TYPE } from "@/lib/payments/status";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type RequestPaymentLinkState =
  | { ok: true; reference: string }
  | { ok?: false; error: string };

/**
 * Crea una solicitud de pago (estado `pending`) para un pedido cuando el cliente
 * elige "Payment Links" en el checkout. El administrador enviará después el
 * enlace de pago desde el panel; el cliente lo verá en su Centro de pagos.
 *
 * El cliente no tiene permiso de escritura sobre `payment_requests` (RLS), por lo
 * que la inserción se hace con la service role tras verificar que el pedido es
 * suyo.
 */
export async function requestPaymentLinkForOrder(
  orderId: string,
): Promise<RequestPaymentLinkState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Debes iniciar sesión." };

    const service = createServiceClient();

    // Verificar propiedad del pedido y leer el total real (evita manipulación).
    const { data: order } = await service
      .from("orders")
      .select("id, user_id, total_cents")
      .eq("id", orderId)
      .maybeSingle();
    if (!order || order.user_id !== user.id) {
      return { error: "Pedido no encontrado." };
    }

    // Marca el tipo de cobro del pedido (PAYMENT_LINK) — aislado de Azul.
    await service
      .from("orders")
      .update({ payment_type: PAYMENT_TYPE.PAYMENT_LINK })
      .eq("id", orderId);

    // Evitar duplicar la solicitud si ya existe una para este pedido (order_id).
    const shortId = orderId.slice(0, 8).toUpperCase();
    const description = `Pago del pedido #${shortId}`;
    const { data: existing } = await service
      .from("payment_requests")
      .select("id, reference_number")
      .eq("order_id", orderId)
      .maybeSingle();
    if (existing) {
      return { ok: true, reference: existing.reference_number as string };
    }

    // Método de pago "Payment Links" (activo).
    const { data: method } = await service
      .from("payment_methods")
      .select("id")
      .eq("code", "payment_link")
      .maybeSingle();
    if (!method) return { error: "Método de pago no disponible." };

    const { data: created, error: insErr } = await service
      .from("payment_requests")
      .insert({
        user_id: user.id,
        order_id: orderId,
        amount_cents: order.total_cents,
        currency: "DOP",
        description,
        payment_method_id: method.id,
        status: "pending",
        created_by: user.id,
      })
      .select("id, reference_number")
      .single();
    if (insErr || !created) {
      return { error: insErr?.message ?? "No se pudo crear la solicitud." };
    }

    const requestId = created.id as string;
    const reference = created.reference_number as string;

    await service.from("payment_status_history").insert({
      payment_request_id: requestId,
      previous_status: null,
      new_status: "pending",
      note: "Solicitud creada desde el checkout (Payment Link).",
      changed_by: user.id,
    });

    // Confirmación in-app para el cliente.
    await service.from("notifications").insert({
      type: "payment",
      target: "user",
      user_id: user.id,
      title: "Solicitud de pago recibida",
      body: `Tu solicitud ${reference} por ${formatDOPFromCents(
        order.total_cents,
      )} está en revisión. Te enviaremos el enlace de pago en breve.`,
      link_path: "/cuenta/pagos",
      created_by: user.id,
    });

    revalidatePath("/cuenta/pagos");
    revalidatePath("/admin/pagos");
    return { ok: true, reference };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado." };
  }
}
