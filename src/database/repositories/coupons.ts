import { createServiceClient } from "@/lib/supabase/server";

/**
 * Validación y cálculo de cupones de descuento.
 *
 * Reglas comprobadas:
 *  - El cupón existe, está activo y no borrado.
 *  - La fecha actual está dentro de `starts_at` / `expires_at` (si definidas).
 *  - El subtotal alcanza `min_order_cents` (si definido).
 *  - No se ha superado `max_uses` global ni `max_uses_per_user`.
 *
 * Tipos de descuento (`discount_type`):
 *  - `percent`: `discount_value` es un porcentaje (0-100).
 *  - `fixed`:   `discount_value` es un importe en céntimos.
 */

export interface CouponValidation {
  valid: boolean;
  reason?: string;
  couponId?: string;
  code?: string;
  discountCents?: number;
  discountType?: string;
  discountValue?: number;
}

interface CouponDbRow {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_cents: number | null;
  max_uses: number | null;
  uses_count: number;
  max_uses_per_user: number | null;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
}

/** Calcula el descuento en céntimos para un cupón dado y un subtotal. */
export function computeDiscountCents(
  discountType: string,
  discountValue: number,
  subtotalCents: number,
): number {
  if (subtotalCents <= 0) return 0;
  if (discountType === "percent") {
    const pct = Math.max(0, Math.min(100, discountValue));
    return Math.min(subtotalCents, Math.round((subtotalCents * pct) / 100));
  }
  // fixed (céntimos)
  return Math.min(subtotalCents, Math.max(0, Math.round(discountValue)));
}

/**
 * Valida un cupón de una tienda concreta: los cupones son de cada tienda y solo
 * descuentan del subtotal de sus productos.
 */
export async function validateCoupon(
  code: string,
  subtotalCents: number,
  storeId: string,
  userId?: string | null,
): Promise<CouponValidation> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { valid: false, reason: "Introduce un código." };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("coupons")
    .select(
      "id, code, discount_type, discount_value, min_order_cents, max_uses, uses_count, max_uses_per_user, is_active, starts_at, expires_at",
    )
    .eq("code", normalized)
    .eq("store_id", storeId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return { valid: false, reason: "Cupón no válido." };
  }
  const c = data as CouponDbRow;

  if (!c.is_active) return { valid: false, reason: "El cupón no está activo." };

  const now = Date.now();
  if (c.starts_at && new Date(c.starts_at).getTime() > now) {
    return { valid: false, reason: "El cupón aún no está disponible." };
  }
  if (c.expires_at && new Date(c.expires_at).getTime() < now) {
    return { valid: false, reason: "El cupón ha caducado." };
  }
  if (c.min_order_cents != null && subtotalCents < c.min_order_cents) {
    return {
      valid: false,
      reason: "El pedido no alcanza el mínimo para este cupón.",
    };
  }
  if (c.max_uses != null && c.uses_count >= c.max_uses) {
    return { valid: false, reason: "El cupón ha alcanzado su límite de usos." };
  }

  if (c.max_uses_per_user != null && userId) {
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("coupon_id", c.id);
    if ((count ?? 0) >= c.max_uses_per_user) {
      return { valid: false, reason: "Ya has usado este cupón." };
    }
  }

  const discountCents = computeDiscountCents(
    c.discount_type,
    c.discount_value,
    subtotalCents,
  );

  return {
    valid: true,
    couponId: c.id,
    code: c.code,
    discountCents,
    discountType: c.discount_type,
    discountValue: c.discount_value,
  };
}

/** Incrementa el contador de usos del cupón (tras crear el pedido). */
export async function incrementCouponUsage(couponId: string): Promise<void> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("coupons")
    .select("uses_count")
    .eq("id", couponId)
    .maybeSingle();
  const current = (data as { uses_count?: number } | null)?.uses_count ?? 0;
  await supabase
    .from("coupons")
    .update({ uses_count: current + 1, updated_at: new Date().toISOString() })
    .eq("id", couponId);
}
