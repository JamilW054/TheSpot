import { createClient } from "@/lib/supabase/server";
import { variantKey } from "@/lib/variants";

export interface ProductStock {
  /** Stock disponible por combinación; clave = variantKey(size, color). */
  stockByKey: Record<string, number>;
  /** Suma de todo el stock disponible. */
  totalStock: number;
  /** false cuando el producto no tiene filas de inventario (stock no rastreado). */
  tracked: boolean;
}

/**
 * Stock disponible por combinación de variante (talla y/o color) de un producto.
 * Disponible = sum(quantity - reserved) en todos los almacenes, por variante activa.
 * La clave usa `variantKey(size, color)` para coincidir con admin, ficha y carrito.
 * `tracked = false` cuando no hay inventario (no se aplica límite de stock).
 */
export async function getStockMatrixForProduct(
  productId: string,
): Promise<ProductStock> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_variants")
    .select("attributes, inventory(quantity, reserved)")
    .eq("product_id", productId)
    .eq("is_active", true);

  const empty: ProductStock = { stockByKey: {}, totalStock: 0, tracked: false };
  if (!data) return empty;

  const stockByKey: Record<string, number> = {};
  let totalStock = 0;
  let tracked = false;

  for (const v of data as unknown as {
    attributes: Record<string, unknown> | null;
    inventory?: { quantity: number; reserved: number }[] | null;
  }[]) {
    const inv = v.inventory ?? [];
    if (inv.length > 0) tracked = true;
    const size =
      typeof v.attributes?.size === "string" ? v.attributes.size : null;
    const color =
      typeof v.attributes?.color === "string" ? v.attributes.color : null;
    const key = variantKey(size, color);
    const avail = inv.reduce(
      (sum, i) => sum + Math.max(0, i.quantity - i.reserved),
      0,
    );
    stockByKey[key] = (stockByKey[key] ?? 0) + avail;
    totalStock += avail;
  }

  return { stockByKey, totalStock, tracked };
}
