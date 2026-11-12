"use server";

import { type CouponValidation, validateCoupon } from "@/database/repositories/coupons";
import { createClient } from "@/lib/supabase/server";

/**
 * Valida un cupón para el subtotal actual del carrito y devuelve el descuento.
 * Los cupones son de cada tienda: `storeId` es la tienda de esa parte del carrito.
 * Pensado para la pantalla de checkout (no aplica nada de forma permanente).
 */
export async function validateCouponAction(
  code: string,
  subtotalCents: number,
  storeId: string,
): Promise<CouponValidation> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return validateCoupon(code, subtotalCents, storeId, user?.id ?? null);
}
