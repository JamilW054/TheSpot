import { getCart } from "@/database/repositories/cart";
import { incrementCouponUsage, validateCoupon } from "@/database/repositories/coupons";
import type { ShippingAddress } from "@/database/repositories/orders";
import { getOrderNotificationEmail } from "@/database/repositories/settings";
import { sendNewOrderAdminEmail } from "@/lib/resend";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/**
 * Checkout real a partir del carrito persistente (`cart_items`).
 *
 * Calcula subtotal, descuento de cupón, envío e impuestos; crea el pedido y sus
 * líneas con snapshot de producto; reserva inventario (best-effort); registra el
 * historial de estado; incrementa el uso del cupón y vacía el carrito.
 */

export interface CheckoutShipping {
  name: string;
  email: string;
  address: string;
  addressLine2?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export interface CheckoutInput {
  shipping: CheckoutShipping;
  shippingMethodId?: string | null;
  couponCode?: string | null;
  notes?: string | null;
}

export interface CheckoutResult {
  orderId: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
}

/** Reserva inventario para una variante (best-effort, primer almacén con stock). */
async function reserveInventory(
  supabase: ReturnType<typeof createServiceClient>,
  variantId: string,
  quantity: number,
): Promise<void> {
  const { data } = await supabase
    .from("inventory")
    .select("id, quantity, reserved")
    .eq("variant_id", variantId)
    .is("deleted_at", null)
    .order("quantity", { ascending: false });
  const rows = (data ?? []) as {
    id: string;
    quantity: number;
    reserved: number;
  }[];
  let remaining = quantity;
  for (const row of rows) {
    if (remaining <= 0) break;
    const available = Math.max(0, row.quantity - row.reserved);
    if (available <= 0) continue;
    const take = Math.min(available, remaining);
    await supabase
      .from("inventory")
      .update({
        reserved: row.reserved + take,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    remaining -= take;
  }
  // Si no hay filas de inventario, el producto se considera de stock no rastreado.
}

export async function checkoutFromCart(
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión para realizar la compra.");

  const cart = await getCart();
  if (cart.length === 0) throw new Error("El carrito está vacío.");

  // 1. Subtotal a partir de los precios congelados del carrito.
  const subtotalCents = cart.reduce((sum, l) => sum + l.lineTotalCents, 0);

  // 2. Cupón (opcional).
  let discountCents = 0;
  let couponId: string | null = null;
  if (input.couponCode?.trim()) {
    const result = await validateCoupon(
      input.couponCode,
      subtotalCents,
      user.id,
    );
    if (!result.valid) throw new Error(result.reason ?? "Cupón no válido.");
    discountCents = result.discountCents ?? 0;
    couponId = result.couponId ?? null;
  }

  // 3. Envío (opcional).
  let shippingCents = 0;
  let shippingMethodId: string | null = null;
  if (input.shippingMethodId?.trim()) {
    const { data: method } = await supabase
      .from("shipping_methods")
      .select("id, price_cents, is_active")
      .eq("id", input.shippingMethodId)
      .is("deleted_at", null)
      .maybeSingle();
    const m = method as {
      id: string;
      price_cents: number;
      is_active: boolean;
    } | null;
    if (!m || !m.is_active) throw new Error("Método de envío no disponible.");
    shippingCents = m.price_cents;
    shippingMethodId = m.id;
  }

  // 4. Impuestos (0 por defecto; los precios incluyen ITBIS).
  const taxCents = 0;
  const totalCents = Math.max(
    0,
    subtotalCents - discountCents + shippingCents + taxCents,
  );

  const shippingAddress: ShippingAddress = {
    full_name: input.shipping.name.trim(),
    email: input.shipping.email.trim(),
    address_line1: input.shipping.address.trim(),
    address_line2: input.shipping.addressLine2?.trim() ?? null,
    city: input.shipping.city?.trim() ?? null,
    state: input.shipping.state?.trim() ?? null,
    postal_code: input.shipping.postalCode?.trim() ?? null,
    country_code: input.shipping.country?.trim() || "DO",
    phone: input.shipping.phone?.trim() ?? null,
  };

  // 5. Crear el pedido.
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      payment_status: "pending",
      subtotal_cents: subtotalCents,
      discount_cents: 0,
      coupon_discount_cents: discountCents,
      tax_cents: taxCents,
      shipping_cents: shippingCents,
      total_cents: totalCents,
      shipping_address: shippingAddress,
      shipping_method_id: shippingMethodId,
      coupon_id: couponId,
      contact_email: input.shipping.email.trim(),
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();
  if (orderError || !orderRow) {
    throw new Error(orderError?.message ?? "No se pudo crear el pedido.");
  }
  const orderId = (orderRow as { id: string }).id;

  // 6. Líneas del pedido con snapshot.
  const itemRows = cart.map((l) => ({
    order_id: orderId,
    variant_id: l.variantId,
    design_id: l.designId,
    quantity: l.quantity,
    unit_price_cents: l.unitPriceCents,
    total_price_cents: l.lineTotalCents,
    texture_url: l.designThumbnail,
    size: l.size,
    color: l.color,
    product_snapshot: {
      name: l.productName,
      slug: l.productSlug,
      cover_image_url: l.coverImage,
      size: l.size,
      color: l.color,
    },
  }));
  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemRows);
  if (itemsError) throw new Error(itemsError.message);

  // 7+. Tareas de servicio (inventario, historial, cupón). Best-effort.
  const service = createServiceClient();
  for (const l of cart) {
    await reserveInventory(service, l.variantId, l.quantity);
  }
  await service.from("order_status_history").insert({
    order_id: orderId,
    status: "pending",
    changed_by: user.id,
    note: "Pedido creado",
  });
  if (couponId) await incrementCouponUsage(couponId);

  // 8. Vaciar el carrito activo.
  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .eq("saved_for_later", false);

  // 9. Aviso por correo al admin (best-effort: no revierte el pedido si falla).
  try {
    const adminEmail = await getOrderNotificationEmail();
    const addressParts = [
      shippingAddress.address_line1,
      shippingAddress.address_line2,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.postal_code,
      shippingAddress.country_code,
    ].filter((p): p is string => Boolean(p?.trim()));
    await sendNewOrderAdminEmail(adminEmail, {
      orderNumber: orderId.slice(0, 8).toUpperCase(),
      orderId,
      customerName: shippingAddress.full_name || "Cliente",
      customerEmail: shippingAddress.email ?? input.shipping.email.trim(),
      customerPhone: shippingAddress.phone,
      shippingAddress: addressParts.length ? addressParts.join(", ") : null,
      items: cart.map((l) => ({
        name: l.productName,
        quantity: l.quantity,
        size: l.size,
        color: l.color,
        unitPrice: l.unitPriceCents,
      })),
      subtotal: subtotalCents,
      shipping: shippingCents,
      discount: discountCents,
      total: totalCents,
      currency: "DOP",
    });
  } catch {
    // Silencioso: el aviso al admin nunca debe tumbar el checkout del cliente.
  }

  return {
    orderId,
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents,
  };
}
