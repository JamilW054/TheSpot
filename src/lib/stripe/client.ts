import Stripe from "stripe";

/**
 * Único punto de inicialización del SDK de Stripe (servidor).
 * No instanciar `new Stripe(...)` fuera de este módulo.
 */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY no configurado.");
  return new Stripe(key);
}

/** Moneda de cobro en Stripe. DOP por defecto (moneda nativa de la tienda). */
export const STRIPE_CURRENCY =
  process.env.STRIPE_CURRENCY?.trim().toLowerCase() || "dop";
