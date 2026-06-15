import { createClient } from "@/lib/supabase/server";

/**
 * Returns available stock per size attribute for a product.
 * Available = sum(quantity - reserved) across all warehouses, per active variant.
 * Returns {} if the product has no inventory rows (untrackedStock).
 */
export async function getStockBySizeForProduct(
  productId: string,
): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_variants")
    .select("attributes, inventory(quantity, reserved)")
    .eq("product_id", productId)
    .eq("is_active", true);

  if (!data) return {};

  const result: Record<string, number> = {};
  for (const v of data as unknown as {
    attributes: Record<string, unknown> | null;
    inventory?: { quantity: number; reserved: number }[] | null;
  }[]) {
    const size = v.attributes?.size;
    if (typeof size !== "string" || !size.trim()) continue;
    const key = size.trim();
    const avail = (v.inventory ?? []).reduce(
      (sum: number, inv: { quantity: number; reserved: number }) =>
        sum + Math.max(0, inv.quantity - inv.reserved),
      0,
    );
    result[key] = (result[key] ?? 0) + avail;
  }
  return result;
}
