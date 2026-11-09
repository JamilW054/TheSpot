import { resolveShippingCents } from "@/config/shipping";
import { incrementCouponUsage, validateCoupon } from "@/database/repositories/coupons";
import {
  type BankAccountSnapshot,
  getCheckoutPaymentOptions,
  getFreeShippingMinCents,
  type PaymentMethod,
  paymentMethodLabel,
} from "@/database/repositories/payments";
import type { ShippingAddress } from "@/database/repositories/orders";
import { getOrderNotificationEmail } from "@/database/repositories/settings";
import { buildCustomerOrderWhatsAppLink } from "@/lib/whatsapp-server";
import { sendNewOrderAdminEmail } from "@/lib/resend";
import { createServiceClient } from "@/lib/supabase/server";
import { variantKey } from "@/lib/variants";

/**
 * Checkout de invitado: no requiere sesión. El carrito vive en el cliente
 * (localStorage, `cart-context.tsx`) y se envía completo en cada intento de
 * compra — el precio autoritativo siempre se resuelve aquí contra la base de
 * datos, nunca se confía en el precio que mande el navegador.
 */

export interface CheckoutGuestItem {
  productId: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

export interface CheckoutShipping {
  name: string;
  email: string;
  phone: string;
  address: string;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export interface CheckoutGuestInput {
  items: CheckoutGuestItem[];
  shipping: CheckoutShipping;
  shippingMethodId?: string | null;
  couponCode?: string | null;
  notes?: string | null;
  /** Método de pago elegido (contra entrega por defecto). */
  paymentMethod?: PaymentMethod | null;
  /** Cuenta a la que el cliente transferirá (solo `bank_transfer`). */
  bankAccountId?: string | null;
}

export interface CheckoutResult {
  orderId: string;
  orderNumber: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  /** Enlace wa.me para que el cliente confirme el pedido con la tienda (best-effort, puede faltar). */
  whatsappUrl: string | null;
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  /** Cuenta elegida para transferir (null si paga contra entrega). */
  bankAccount: BankAccountSnapshot | null;
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  base_price_cents: number;
  cost_cents: number | null;
  is_active: boolean;
}

interface VariantRow {
  id: string;
  product_id: string;
  price_cents: number | null;
  attributes: Record<string, unknown> | null;
  is_active: boolean;
}

interface ResolvedLine {
  productId: string;
  productName: string;
  productSlug: string;
  coverImage: string;
  variantId: string | null;
  quantity: number;
  size: string | null;
  color: string | null;
  unitPriceCents: number;
  unitCostCents: number;
  lineTotalCents: number;
}

/** Resuelve cada línea del carrito contra products/product_variants (precio autoritativo). */
async function resolveLines(
  supabase: ReturnType<typeof createServiceClient>,
  items: CheckoutGuestItem[],
): Promise<ResolvedLine[]> {
  const productIds = [...new Set(items.map((i) => i.productId))];
  if (productIds.length === 0) return [];

  const { data: productRows, error: productsError } = await supabase
    .from("products")
    .select("id, slug, name, base_price_cents, cost_cents, is_active")
    .in("id", productIds)
    .is("deleted_at", null);
  if (productsError) throw new Error(productsError.message);

  const { data: mediaRows } = await supabase
    .from("product_media")
    .select("product_id, url, is_cover, sort_order")
    .in("product_id", productIds);

  const { data: variantRows, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, product_id, price_cents, attributes, is_active")
    .in("product_id", productIds)
    .eq("is_active", true);
  if (variantsError) throw new Error(variantsError.message);

  const productsById = new Map(
    (productRows as ProductRow[] | null ?? []).map((p) => [p.id, p]),
  );
  const coverByProduct = new Map<string, string>();
  for (const m of (mediaRows ?? []) as {
    product_id: string;
    url: string;
    is_cover: boolean | null;
    sort_order: number | null;
  }[]) {
    const existing = coverByProduct.get(m.product_id);
    if (!existing || m.is_cover) coverByProduct.set(m.product_id, m.url);
  }
  const variantsByProduct = new Map<string, VariantRow[]>();
  for (const v of (variantRows as VariantRow[] | null) ?? []) {
    const arr = variantsByProduct.get(v.product_id) ?? [];
    arr.push(v);
    variantsByProduct.set(v.product_id, arr);
  }

  const resolved: ResolvedLine[] = [];
  for (const rawItem of items) {
    let item = rawItem;
    if (item.quantity < 1) continue;
    const product = productsById.get(item.productId);
    if (!product || !product.is_active) {
      throw new Error(`Uno de los productos ya no está disponible.`);
    }
    const candidates = variantsByProduct.get(item.productId) ?? [];
    let variantId: string | null = null;
    let unitPriceCents = product.base_price_cents;
    if (candidates.length > 0) {
      const sizeOf = (v: VariantRow) =>
        typeof v.attributes?.size === "string" ? v.attributes.size : null;
      const colorOf = (v: VariantRow) =>
        typeof v.attributes?.color === "string" ? v.attributes.color : null;
      const key = variantKey(item.size, item.color);
      let match = candidates.find(
        (v) => variantKey(sizeOf(v), colorOf(v)) === key,
      );
      // El tamaño/talla es opcional: si el cliente no eligió, se toma la
      // primera variante que coincida con el color (o cualquiera si no hay color).
      if (!match && !item.size?.trim()) {
        const wantColor = variantKey(null, item.color);
        match =
          candidates.find((v) => variantKey(null, colorOf(v)) === wantColor) ??
          (item.color ? undefined : candidates[0]);
        if (match) item = { ...item, size: sizeOf(match) };
      }
      if (!match) {
        throw new Error(`"${product.name}": ese tamaño ya no está disponible.`);
      }
      variantId = match.id;
      unitPriceCents = match.price_cents ?? product.base_price_cents;
    }
    resolved.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      coverImage: coverByProduct.get(product.id) ?? "",
      variantId,
      quantity: item.quantity,
      size: item.size ?? null,
      color: item.color ?? null,
      unitPriceCents,
      unitCostCents: product.cost_cents ?? 0,
      lineTotalCents: unitPriceCents * item.quantity,
    });
  }
  return resolved;
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
  const rows = (data ?? []) as { id: string; quantity: number; reserved: number }[];
  let remaining = quantity;
  for (const row of rows) {
    if (remaining <= 0) break;
    const available = Math.max(0, row.quantity - row.reserved);
    if (available <= 0) continue;
    const take = Math.min(available, remaining);
    await supabase
      .from("inventory")
      .update({ reserved: row.reserved + take, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    remaining -= take;
  }
  // Si no hay filas de inventario, el producto se considera de stock no rastreado.
}

export async function checkoutGuest(
  input: CheckoutGuestInput,
): Promise<CheckoutResult> {
  if (input.items.length === 0) throw new Error("El carrito está vacío.");
  const name = input.shipping.name.trim();
  const email = input.shipping.email.trim();
  const phone = input.shipping.phone.trim();
  const address = input.shipping.address.trim();
  if (!name || !email || !phone || !address) {
    throw new Error("Completa nombre, correo, teléfono y dirección.");
  }

  const supabase = createServiceClient();

  // Método de pago: solo los habilitados en /admin/pagos.
  const paymentOptions = await getCheckoutPaymentOptions();
  const paymentMethod: PaymentMethod =
    input.paymentMethod ?? paymentOptions.methods[0].method;
  if (!paymentOptions.methods.some((m) => m.method === paymentMethod)) {
    throw new Error("Ese método de pago no está disponible.");
  }
  let bankAccount: BankAccountSnapshot | null = null;
  if (paymentMethod === "bank_transfer") {
    bankAccount =
      paymentOptions.bankAccounts.find((b) => b.id === input.bankAccountId) ??
      (paymentOptions.bankAccounts.length === 1
        ? paymentOptions.bankAccounts[0]
        : null);
    if (!bankAccount) {
      throw new Error("Elige el banco al que vas a transferir.");
    }
  }

  const lines = await resolveLines(supabase, input.items);
  if (lines.length === 0) throw new Error("El carrito está vacío.");

  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);

  let discountCents = 0;
  let couponId: string | null = null;
  if (input.couponCode?.trim()) {
    const result = await validateCoupon(input.couponCode, subtotalCents);
    if (!result.valid) throw new Error(result.reason ?? "Cupón no válido.");
    discountCents = result.discountCents ?? 0;
    couponId = result.couponId ?? null;
  }

  let shippingCents = 0;
  let shippingMethodId: string | null = null;
  if (input.shippingMethodId?.trim()) {
    const { data: method } = await supabase
      .from("shipping_methods")
      .select("id, price_cents, is_active")
      .eq("id", input.shippingMethodId)
      .is("deleted_at", null)
      .maybeSingle();
    const m = method as { id: string; price_cents: number; is_active: boolean } | null;
    if (!m || !m.is_active) throw new Error("Método de envío no disponible.");
    shippingCents = resolveShippingCents(
      subtotalCents,
      m.price_cents,
      await getFreeShippingMinCents(),
    );
    shippingMethodId = m.id;
  }

  const taxCents = 0;
  const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents + taxCents);

  const shippingAddress: ShippingAddress = {
    full_name: name,
    email,
    phone,
    address_line1: address,
    address_line2: input.shipping.addressLine2?.trim() ?? null,
    city: input.shipping.city?.trim() ?? null,
    state: input.shipping.state?.trim() ?? null,
    postal_code: input.shipping.postalCode?.trim() ?? null,
    country_code: input.shipping.country?.trim() || "DO",
  };

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: null,
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
      contact_email: email,
      notes: input.notes?.trim() || null,
      payment_method: paymentMethod,
      bank_account_id: bankAccount?.id ?? null,
      bank_account_snapshot: bankAccount,
    })
    .select("id")
    .single();
  if (orderError || !orderRow) {
    throw new Error(orderError?.message ?? "No se pudo crear el pedido.");
  }
  const orderId = (orderRow as { id: string }).id;
  const orderNumber = orderId.slice(0, 8).toUpperCase();

  const itemRows = lines.map((l) => ({
    order_id: orderId,
    variant_id: l.variantId,
    quantity: l.quantity,
    unit_price_cents: l.unitPriceCents,
    unit_cost_cents: l.unitCostCents,
    total_price_cents: l.lineTotalCents,
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
  const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
  if (itemsError) throw new Error(itemsError.message);

  // Tareas de servicio (inventario, historial, cupón). Best-effort.
  for (const l of lines) {
    if (l.variantId) await reserveInventory(supabase, l.variantId, l.quantity);
  }
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: "pending",
    changed_by: null,
    note: "Pedido creado (invitado)",
  });
  if (couponId) await incrementCouponUsage(couponId);

  // Aviso por correo al admin (best-effort: no revierte el pedido si falla).
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
      orderNumber,
      orderId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: addressParts.length ? addressParts.join(", ") : null,
      items: lines.map((l) => ({
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
      paymentMethod: paymentMethodLabel(paymentMethod),
      bankAccount: bankAccount
        ? `${bankAccount.bankName} · ${bankAccount.accountType} ${bankAccount.accountNumber}`
        : null,
      notes: input.notes?.trim() || null,
    });
  } catch {
    // Silencioso: el aviso al admin nunca debe tumbar el checkout del cliente.
  }

  // Enlace de WhatsApp para que el cliente confirme el pedido (best-effort).
  let whatsappUrl: string | null = null;
  try {
    whatsappUrl = await buildCustomerOrderWhatsAppLink({
      orderNumber,
      customerName: name,
      items: lines.map((l) => ({ name: l.productName, quantity: l.quantity, size: l.size })),
      totalCents,
      paymentMethod: paymentMethodLabel(paymentMethod),
      bankName: bankAccount?.bankName ?? null,
    });
  } catch {
    whatsappUrl = null;
  }

  return {
    orderId,
    orderNumber,
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents,
    whatsappUrl,
    paymentMethod,
    paymentMethodLabel: paymentMethodLabel(paymentMethod),
    bankAccount,
  };
}
