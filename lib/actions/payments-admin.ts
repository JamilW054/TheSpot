"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { markLinkedOrderAsPaid, onOrderPaymentSucceeded } from "@/lib/db";
import { sendPaymentConfirmedEmail, sendPaymentLinkEmail } from "@/lib/emails";
import { formatDOPFromCents } from "@/lib/format-currency";
import { formatDateTime } from "@/lib/format-date";
import { type PaymentStatus, paymentStatusMeta } from "@/lib/payments/status";
import { createServiceClient } from "@/lib/supabase/server";

export type PaymentActionState = { ok?: true; error?: string; id?: string };

function ok(id?: string): PaymentActionState {
  return { ok: true, id };
}

function fail(e: unknown): PaymentActionState {
  return { error: e instanceof Error ? e.message : "Error inesperado." };
}

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key)?.toString().trim();
  return v && v.length > 0 ? v : null;
}

function requiredStr(fd: FormData, key: string, label: string): string {
  const v = str(fd, key);
  if (!v) throw new Error(`${label} es obligatorio.`);
  return v;
}

function moneyToCents(raw: string | null): number {
  if (!raw) throw new Error("El monto es obligatorio.");
  const n = Number.parseFloat(raw.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) throw new Error("Monto inválido.");
  return Math.round(n * 100);
}

/** Email + nombre del cliente desde auth.users (service role). */
async function getCustomer(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
): Promise<{ email: string | null; name: string }> {
  const { data } = await supabase.auth.admin.getUserById(userId);
  const user = data?.user;
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (meta.full_name as string | undefined)?.trim() ||
    (meta.name as string | undefined)?.trim() ||
    user?.email?.split("@")[0] ||
    "Cliente";
  return { email: user?.email ?? null, name };
}

/** Envía un correo transaccional (no bloqueante) y registra el intento en `email_logs`. */
async function sendAndLogEmail(
  supabase: ReturnType<typeof createServiceClient>,
  params: {
    requestId: string;
    email: string;
    emailType: string;
    send: () => Promise<unknown>;
  },
): Promise<void> {
  let deliveryStatus = "sent";
  let providerResponse: unknown = null;
  try {
    const res = await params.send();
    providerResponse = res;
    if ((res as { error?: unknown } | undefined)?.error)
      deliveryStatus = "failed";
  } catch (e) {
    deliveryStatus = "failed";
    providerResponse = { message: e instanceof Error ? e.message : String(e) };
  }
  await supabase.from("email_logs").insert({
    payment_request_id: params.requestId,
    recipient_email: params.email,
    email_type: params.emailType,
    delivery_status: deliveryStatus,
    provider_response: providerResponse,
    sent_at: new Date().toISOString(),
  });
}

function revalidatePaymentPaths() {
  revalidatePath("/admin/pagos");
  revalidatePath("/cuenta/pagos");
  revalidatePath("/cuenta/notificaciones");
}

/**
 * Envía un enlace de pago a un cliente: crea la solicitud, registra el historial,
 * crea la notificación in-app, envía el correo (Resend) y registra la entrega.
 * El fallo del correo NO revierte la solicitud: se registra como `failed`.
 */
export async function adminSendPaymentLink(
  _prev: PaymentActionState | undefined,
  fd: FormData,
): Promise<PaymentActionState> {
  try {
    const admin = await requireAdmin();
    const supabase = createServiceClient();

    const userId = requiredStr(fd, "user_id", "El cliente");
    const amountCents = moneyToCents(str(fd, "amount"));
    const description = str(fd, "description");
    const paymentUrl = requiredStr(fd, "payment_url", "El enlace de pago");

    // Este módulo gestiona exclusivamente enlaces de pago (PAYMENT_LINK). El
    // método se resuelve por código en el servidor; Azul nunca se cobra aquí.
    const { data: method } = await supabase
      .from("payment_methods")
      .select("id, name, is_active, is_disabled")
      .eq("code", "payment_link")
      .maybeSingle();
    if (!method) throw new Error("Método de pago no encontrado.");
    if (method.is_disabled || !method.is_active) {
      throw new Error("Ese método de pago no está disponible.");
    }

    // 1. Crear la solicitud (estado link_sent: se crea y envía en un paso).
    const { data: created, error: insErr } = await supabase
      .from("payment_requests")
      .insert({
        user_id: userId,
        amount_cents: amountCents,
        currency: "DOP",
        description,
        payment_method_id: method.id,
        payment_url: paymentUrl,
        status: "link_sent",
        sent_at: new Date().toISOString(),
        created_by: admin.userId,
      })
      .select("id, reference_number, status")
      .single();
    if (insErr || !created) {
      throw new Error(insErr?.message ?? "No se pudo crear la solicitud.");
    }

    const requestId = created.id as string;
    const reference = created.reference_number as string;

    // 2. Historial de estado.
    await supabase.from("payment_status_history").insert({
      payment_request_id: requestId,
      previous_status: null,
      new_status: "link_sent",
      note: "Enlace de pago enviado al cliente.",
      changed_by: admin.userId,
    });

    // 3. Notificación in-app dirigida al cliente.
    const amountLabel = formatDOPFromCents(amountCents);
    await supabase.from("notifications").insert({
      type: "payment",
      target: "user",
      user_id: userId,
      title: "Nueva solicitud de pago",
      body: `Recibiste una solicitud de pago por ${amountLabel} (${reference}).`,
      link_path: "/cuenta/pagos",
      created_by: admin.userId,
    });

    // 4. Correo + registro de entrega (no bloqueante).
    const { email, name } = await getCustomer(supabase, userId);
    if (email) {
      await sendAndLogEmail(supabase, {
        requestId,
        email,
        emailType: "payment_link",
        send: () =>
          sendPaymentLinkEmail(email, {
            name,
            referenceNumber: reference,
            amountCents,
            currency: "DOP",
            description,
            statusLabel: "Enlace enviado",
            methodLabel: method.name as string,
            paymentUrl,
          }),
      });
    }

    revalidatePaymentPaths();
    return ok(requestId);
  } catch (e) {
    return fail(e);
  }
}

/**
 * Actualiza manualmente el estado de una solicitud: persiste el cambio, registra
 * el historial, fija `paid_at`/`sent_at` según corresponda y notifica al cliente.
 */
export async function adminUpdatePaymentStatus(
  requestId: string,
  newStatus: PaymentStatus,
  note?: string,
): Promise<PaymentActionState> {
  try {
    const admin = await requireAdmin();
    const supabase = createServiceClient();

    const { data: current } = await supabase
      .from("payment_requests")
      .select(
        "id, user_id, status, reference_number, amount_cents, currency, description, order_id, payment_methods(name)",
      )
      .eq("id", requestId)
      .maybeSingle();
    if (!current) throw new Error("Solicitud no encontrada.");
    const previousStatus = current.status as PaymentStatus;
    if (previousStatus === newStatus) return ok(requestId);

    const paidAtIso = new Date().toISOString();
    const patch: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (newStatus === "paid") patch.paid_at = paidAtIso;
    if (newStatus === "link_sent") patch.sent_at = new Date().toISOString();

    const { error: updErr } = await supabase
      .from("payment_requests")
      .update(patch)
      .eq("id", requestId);
    if (updErr) throw new Error(updErr.message);

    await supabase.from("payment_status_history").insert({
      payment_request_id: requestId,
      previous_status: previousStatus,
      new_status: newStatus,
      note: note ?? null,
      changed_by: admin.userId,
    });

    const meta = paymentStatusMeta(newStatus);
    await supabase.from("notifications").insert({
      type: "payment",
      target: "user",
      user_id: current.user_id,
      title: `Pago ${meta.label.toLowerCase()}`,
      body: `Tu solicitud ${current.reference_number} cambió a "${meta.label}".`,
      link_path: "/cuenta/pagos",
      created_by: admin.userId,
    });

    if (newStatus === "paid") {
      const orderId = current.order_id as string | null;
      if (orderId) {
        // Enlaza el pago confirmado con su pedido: así cuenta para el sorteo
        // y dispara el recibo de compra (con productos), igual que el
        // retorno de Azul.
        const transitioned = await markLinkedOrderAsPaid(orderId);
        if (transitioned) {
          await onOrderPaymentSucceeded({
            orderId,
            paymentMethodLabel: "Payment Link",
            paidAtIso,
          });
        }
      } else {
        // Solicitud manual sin pedido asociado: no hay productos que listar
        // ni compra que contar para el sorteo, pero el cliente sí debe
        // recibir una confirmación de que su pago quedó registrado.
        const { email, name } = await getCustomer(
          supabase,
          current.user_id as string,
        );
        if (email) {
          const method = (current.payment_methods ?? {}) as {
            name?: string;
          };
          await sendAndLogEmail(supabase, {
            requestId,
            email,
            emailType: "payment_confirmed",
            send: () =>
              sendPaymentConfirmedEmail(email, {
                name,
                referenceNumber: current.reference_number as string,
                amountCents: current.amount_cents as number,
                currency: (current.currency as string) ?? "DOP",
                description: (current.description as string | null) ?? null,
                methodLabel: method.name ?? "Payment Link",
                paidAtLabel: formatDateTime(paidAtIso, {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }),
          });
        }
      }
    }

    revalidatePaymentPaths();
    return ok(requestId);
  } catch (e) {
    return fail(e);
  }
}

/**
 * Envía (o reenvía) el enlace de pago de una solicitud existente desde el panel
 * de Gestión de pagos: fija/actualiza el `payment_url`, pasa la solicitud a
 * `link_sent`, registra el historial, notifica al cliente y reenvía el correo.
 * Pensado para el botón "Enviar enlace" de cada fila (no crea solicitudes).
 */
export async function adminResendPaymentLink(
  requestId: string,
  paymentUrl: string,
): Promise<PaymentActionState> {
  try {
    const admin = await requireAdmin();
    const supabase = createServiceClient();

    const url = paymentUrl?.trim();
    if (!url) throw new Error("El enlace de pago es obligatorio.");

    const { data: current } = await supabase
      .from("payment_requests")
      .select(
        "id, user_id, status, reference_number, amount_cents, currency, description, payment_methods(name)",
      )
      .eq("id", requestId)
      .maybeSingle();
    if (!current) throw new Error("Solicitud no encontrada.");
    if (current.status === "paid") {
      throw new Error("Esta solicitud ya está pagada.");
    }

    const previousStatus = current.status as PaymentStatus;
    const method = (current.payment_methods ?? {}) as { name?: string };

    const { error: updErr } = await supabase
      .from("payment_requests")
      .update({
        payment_url: url,
        status: "link_sent",
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);
    if (updErr) throw new Error(updErr.message);

    await supabase.from("payment_status_history").insert({
      payment_request_id: requestId,
      previous_status: previousStatus,
      new_status: "link_sent",
      note: "Enlace de pago enviado al cliente.",
      changed_by: admin.userId,
    });

    const amountCents = (current.amount_cents as number) ?? 0;
    const reference = current.reference_number as string;
    await supabase.from("notifications").insert({
      type: "payment",
      target: "user",
      user_id: current.user_id,
      title: "Enlace de pago disponible",
      body: `Tu solicitud ${reference} por ${formatDOPFromCents(
        amountCents,
      )} ya tiene un enlace de pago listo.`,
      link_path: "/cuenta/pagos",
      created_by: admin.userId,
    });

    const { email, name } = await getCustomer(
      supabase,
      current.user_id as string,
    );
    if (email) {
      await sendAndLogEmail(supabase, {
        requestId,
        email,
        emailType: "payment_link",
        send: () =>
          sendPaymentLinkEmail(email, {
            name,
            referenceNumber: reference,
            amountCents,
            currency: (current.currency as string) ?? "DOP",
            description: (current.description as string | null) ?? null,
            statusLabel: "Enlace enviado",
            methodLabel: method.name ?? "Payment Link",
            paymentUrl: url,
          }),
      });
    }

    revalidatePaymentPaths();
    return ok(requestId);
  } catch (e) {
    return fail(e);
  }
}

/** Elimina una solicitud de pago (cascada borra historial y logs). */
export async function adminDeletePaymentRequest(
  requestId: string,
): Promise<PaymentActionState> {
  try {
    await requireAdmin();
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("payment_requests")
      .delete()
      .eq("id", requestId);
    if (error) throw new Error(error.message);
    revalidatePaymentPaths();
    return ok();
  } catch (e) {
    return fail(e);
  }
}
