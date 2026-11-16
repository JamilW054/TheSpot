"use server";

import { revalidatePath } from "next/cache";
import { requireStoreActor, assertStoreAccess } from "@/lib/auth/store-actor";
import { createServiceClient } from "@/lib/supabase/server";

type ServiceClient = ReturnType<typeof createServiceClient>;

async function defaultWarehouseId(supabase: ServiceClient, storeId: string): Promise<string> {
  const { data } = await supabase
    .from("warehouses")
    .select("id")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const id = (data as { id?: string } | null)?.id;
  if (id) return id;
  const { data: created, error } = await supabase
    .from("warehouses")
    .insert({ name: "Principal", country_code: "DO", is_active: true, store_id: storeId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return (created as { id: string }).id;
}

export type InventoryActionResult = { ok: true } | { ok: false; error: string };

/**
 * Fija la existencia física de una variante (conteo de bodega). No toca lo
 * reservado por pedidos abiertos: si la nueva existencia es menor que lo
 * reservado, el disponible queda en 0.
 */
export async function adminSetVariantStock(
  variantId: string,
  quantity: number,
): Promise<InventoryActionResult> {
  try {
    const actor = await requireStoreActor();
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 1_000_000) {
      throw new Error("La existencia debe ser un número entero ≥ 0.");
    }
    const supabase = createServiceClient();
    const { data: variant } = await supabase
      .from("product_variants")
      .select("id, products!inner(store_id)")
      .eq("id", variantId)
      .maybeSingle();
    const storeId = (variant as { products?: { store_id?: string } } | null)?.products?.store_id;
    if (!storeId) throw new Error("Variante no encontrada.");
    assertStoreAccess(actor, storeId);
    const { data: rows } = await supabase
      .from("inventory")
      .select("id")
      .eq("variant_id", variantId)
      .is("deleted_at", null)
      .order("quantity", { ascending: false });
    const list = (rows ?? []) as { id: string }[];
    if (list.length === 0) {
      const warehouseId = await defaultWarehouseId(supabase, storeId);
      const { error } = await supabase.from("inventory").insert({
        variant_id: variantId,
        warehouse_id: warehouseId,
        quantity,
      });
      if (error) throw new Error(error.message);
    } else {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("inventory")
        .update({ quantity, updated_at: now })
        .eq("id", list[0].id);
      if (error) throw new Error(error.message);
      // Una sola bodega: filas extra quedan en 0 para no duplicar existencias.
      if (list.length > 1) {
        await supabase
          .from("inventory")
          .update({ quantity: 0, updated_at: now })
          .in(
            "id",
            list.slice(1).map((r) => r.id),
          );
      }
    }
    revalidatePath("/admin/inventario");
    revalidatePath("/panel/inventario");
    revalidatePath("/panel");
    revalidatePath("/catalogo", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
  }
}
