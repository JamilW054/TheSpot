"use server";

import {
  createOrder,
  type CreateOrderItem,
  type CreateOrderShipping,
} from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

const LOGIN_REQUIRED_MSG = "Debes iniciar sesión para realizar la compra.";

export async function createOrderAction(
  shipping: CreateOrderShipping,
  items: CreateOrderItem[],
  sessionId?: string | null,
): Promise<CreateOrderResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: LOGIN_REQUIRED_MSG };
  }
  try {
    const { orderId } = await createOrder(shipping, items, sessionId);
    return { ok: true, orderId };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al crear el pedido";
    return { ok: false, error: message };
  }
}
