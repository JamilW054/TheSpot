"use server";

import { getOrderStatusesByNumber } from "@/database/repositories";
import type { OrderStatusDetail } from "@/types";

export type OrderStatusResult =
  | { ok: true; orders: OrderStatusDetail[] }
  | { ok: false; error: string };

export async function getOrderStatusAction(
  orderId: string,
): Promise<OrderStatusResult> {
  const trimmed = orderId?.trim();
  if (!trimmed) {
    return { ok: false, error: "Introduce el número de pedido o de compra." };
  }
  const orders = await getOrderStatusesByNumber(trimmed);
  if (orders.length === 0) {
    return {
      ok: false,
      error: "No hemos encontrado ningún pedido con ese número.",
    };
  }
  return { ok: true, orders };
}
