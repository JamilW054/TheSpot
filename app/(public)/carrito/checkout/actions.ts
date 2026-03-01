"use server";

import { createOrder, type CreateOrderItem, type CreateOrderShipping } from "@/lib/db";

export type CreateOrderResult = { ok: true; orderId: string } | { ok: false; error: string };

export async function createOrderAction(
  shipping: CreateOrderShipping,
  items: CreateOrderItem[],
  sessionId?: string | null
): Promise<CreateOrderResult> {
  try {
    const { orderId } = await createOrder(shipping, items, sessionId);
    return { ok: true, orderId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear el pedido";
    return { ok: false, error: message };
  }
}
