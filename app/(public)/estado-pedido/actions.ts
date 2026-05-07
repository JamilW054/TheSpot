"use server";

import { getOrderStatusById } from "@/lib/db";
import type { OrderStatusDetail } from "@/types";

export type OrderStatusResult =
  | { ok: true; order: OrderStatusDetail }
  | { ok: false; error: string };

export async function getOrderStatusAction(
  orderId: string,
): Promise<OrderStatusResult> {
  const trimmed = orderId?.trim();
  if (!trimmed) {
    return { ok: false, error: "Introduce el número de pedido." };
  }
  const order = await getOrderStatusById(trimmed);
  if (!order) {
    return {
      ok: false,
      error: "No hemos encontrado ningún pedido con ese número.",
    };
  }
  return { ok: true, order };
}
