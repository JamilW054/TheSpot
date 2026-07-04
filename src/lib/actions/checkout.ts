"use server";

import { revalidatePath } from "next/cache";
import {
  type CheckoutInput,
  type CheckoutResult,
  checkoutFromCart,
} from "@/database/repositories/checkout";

export type CheckoutActionState =
  | { ok: true; result: CheckoutResult }
  | { ok?: false; error: string };

/**
 * Crea el pedido a partir del carrito persistente del usuario. Devuelve el id
 * del pedido y el desglose de totales para continuar al pago.
 */
export async function checkoutAction(
  input: CheckoutInput,
): Promise<CheckoutActionState> {
  try {
    const result = await checkoutFromCart(input);
    revalidatePath("/carrito");
    revalidatePath("/cuenta/pedidos");
    return { ok: true, result };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado." };
  }
}
