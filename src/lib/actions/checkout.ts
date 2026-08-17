"use server";

import {
  type CheckoutGuestInput,
  type CheckoutResult,
  checkoutGuest,
} from "@/database/repositories/checkout";

export type CheckoutActionState =
  | { ok: true; result: CheckoutResult }
  | { ok?: false; error: string };

/** Crea el pedido de invitado a partir del carrito enviado desde el cliente. */
export async function checkoutAction(
  input: CheckoutGuestInput,
): Promise<CheckoutActionState> {
  try {
    const result = await checkoutGuest(input);
    return { ok: true, result };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado." };
  }
}
