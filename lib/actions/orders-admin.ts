"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/server";

export type OrderFulfillmentStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "cancelled";

export async function adminSetOrdersStatus(
  ids: string[],
  status: OrderFulfillmentStatus,
): Promise<void> {
  await requireAdmin();
  const unique = [...new Set(ids.map((x) => x.trim()).filter(Boolean))];
  if (unique.length === 0) return;
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .in("id", unique);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/facturas");
  revalidatePath("/admin");
}
