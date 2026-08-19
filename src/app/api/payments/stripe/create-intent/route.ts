import { NextResponse } from "next/server";
import { getStripe, STRIPE_CURRENCY } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface OrderRow {
  id: string;
  total_cents: number;
  payment_status: string | null;
  contact_email: string | null;
}

/**
 * POST { orderId } → crea (o reutiliza) el PaymentIntent de Stripe para un
 * pedido ya existente y devuelve el `clientSecret` que el navegador necesita
 * para mostrar el botón de Apple Pay / tarjeta. El pedido se crea antes por
 * el checkout de invitado normal (`checkoutAction`); esto solo habilita
 * pagarlo en línea en vez de coordinar por WhatsApp.
 */
export async function POST(request: Request) {
  let body: { orderId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  if (!orderId) {
    return NextResponse.json({ error: "Falta orderId." }, { status: 400 });
  }

  let stripe: ReturnType<typeof getStripe>;
  try {
    stripe = getStripe();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Stripe no configurado." },
      { status: 503 },
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, total_cents, payment_status, contact_email")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json(
      { error: "Pedido no encontrado." },
      { status: 404 },
    );
  }
  const order = data as OrderRow;
  if (order.payment_status === "paid") {
    return NextResponse.json(
      { error: "Este pedido ya está pagado." },
      { status: 409 },
    );
  }
  if (!order.total_cents || order.total_cents <= 0) {
    return NextResponse.json({ error: "Total inválido." }, { status: 400 });
  }

  const intent = await stripe.paymentIntents.create({
    amount: order.total_cents,
    currency: STRIPE_CURRENCY,
    receipt_email: order.contact_email ?? undefined,
    metadata: { order_id: order.id },
    automatic_payment_methods: { enabled: true },
  });

  await supabase
    .from("orders")
    .update({
      stripe_payment_intent_id: intent.id,
      payment_provider: "stripe",
    })
    .eq("id", order.id);

  return NextResponse.json({ clientSecret: intent.client_secret });
}
