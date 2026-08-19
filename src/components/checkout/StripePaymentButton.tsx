"use client";

import { Elements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import {
  loadStripe,
  type PaymentRequest,
  type Stripe as StripeJs,
} from "@stripe/stripe-js";
import { useEffect, useState } from "react";

let stripePromise: Promise<StripeJs | null> | null = null;
function getStripeJs(): Promise<StripeJs | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    stripePromise = publishableKey
      ? loadStripe(publishableKey)
      : Promise.resolve(null);
  }
  return stripePromise;
}

interface StripePaymentButtonProps {
  orderId: string;
  orderNumber: string;
  totalCents: number;
  onPaid: () => void;
}

/**
 * Botón de pago en línea (Apple Pay / Google Pay / tarjeta) para un pedido
 * ya creado. Usa el Payment Request Button de Stripe: el navegador decide
 * qué wallet mostrar (Apple Pay solo aparece en Safari/macOS/iOS con una
 * tarjeta en Apple Wallet); si ninguno está disponible, el botón
 * simplemente no se renderiza y el cliente sigue con el flujo de WhatsApp.
 */
export function StripePaymentButton(props: StripePaymentButtonProps) {
  const [stripe, setStripe] = useState<StripeJs | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStripeJs().then((s) => {
      if (!cancelled) setStripe(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || !stripe) return null;

  return (
    <Elements stripe={stripe}>
      <PaymentRequestButton {...props} stripe={stripe} />
    </Elements>
  );
}

function PaymentRequestButton({
  orderId,
  orderNumber,
  totalCents,
  onPaid,
  stripe,
}: StripePaymentButtonProps & { stripe: StripeJs }) {
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(
    null,
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // "country" es el país de registro de la cuenta de Stripe (no el del
    // cliente) y "currency" debe coincidir con STRIPE_CURRENCY del backend
    // (src/lib/stripe/client.ts) — ajusta ambos si cambian.
    const pr = stripe.paymentRequest({
      country: "US",
      currency: "dop",
      total: { label: `Pedido #${orderNumber}`, amount: totalCents },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      if (!cancelled && result) setPaymentRequest(pr);
    });

    pr.on("paymentmethod", async (ev) => {
      try {
        const res = await fetch("/api/payments/stripe/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (!res.ok || !data.clientSecret) {
          ev.complete("fail");
          setError(data.error ?? "No se pudo iniciar el pago.");
          return;
        }
        setClientSecret(data.clientSecret);

        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(
            data.clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false },
          );

        if (confirmError) {
          ev.complete("fail");
          setError(confirmError.message ?? "El pago fue rechazado.");
          return;
        }
        ev.complete("success");

        if (paymentIntent?.status === "requires_action") {
          const { error: actionError } = await stripe.confirmCardPayment(
            data.clientSecret,
          );
          if (actionError) {
            setError(actionError.message ?? "El pago fue rechazado.");
            return;
          }
        }
        onPaid();
      } catch {
        ev.complete("fail");
        setError("No se pudo completar el pago. Intenta de nuevo.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [stripe, orderId, orderNumber, totalCents, onPaid]);

  if (!paymentRequest) return null;

  return (
    <div className="mt-4">
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: { paymentRequestButton: { theme: "dark", height: "48px" } },
        }}
      />
      {error && (
        <p className="mt-2 text-center text-xs text-destructive">{error}</p>
      )}
      {clientSecret && (
        <p className="sr-only">Procesando pago del pedido {orderId}…</p>
      )}
    </div>
  );
}
