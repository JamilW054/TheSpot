import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  markLinkedOrderAsPaid,
  onOrderPaymentSucceeded,
} from "@/database/repositories";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";

const PAYMENT_METHOD_LABEL = "Apple Pay / tarjeta (Stripe)";

/**
 * Webhook de Stripe. Configurar en el dashboard de Stripe apuntando a
 * `<dominio>/api/payments/stripe/webhook`, suscrito al evento
 * `payment_intent.succeeded`, y copiar el "signing secret" a
 * STRIPE_WEBHOOK_SECRET. La firma se verifica siempre — nunca se marca un
 * pedido como pagado a partir de una llamada sin firmar.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Webhook de Stripe no configurado." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (e) {
    return NextResponse.json(
      { error: `Firma inválida: ${e instanceof Error ? e.message : "error"}` },
      { status: 400 },
    );
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.order_id;
    if (orderId && (await markLinkedOrderAsPaid(orderId))) {
      await onOrderPaymentSucceeded({
        orderId,
        paymentMethodLabel: PAYMENT_METHOD_LABEL,
        paidAtIso: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
}
