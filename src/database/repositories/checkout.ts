import { resolveShippingCents } from "@/config/shipping";
import { incrementCouponUsage, validateCoupon } from "@/database/repositories/coupons";
import type { ShippingAddress } from "@/database/repositories/orders";
import {
  type BankAccountSnapshot,
  getCheckoutPaymentOptionsByStore,
  type PaymentMethod,
  paymentMethodLabel,
} from "@/database/repositories/payments";
import { getStoresCheckoutInfo, type StoreCheckoutInfo } from "@/database/repositories/stores";
import { groupByStore, type PartTotals, partTotal, sumParts } from "@/lib/checkout/split";
import { sendNewOrderAdminEmail } from "@/lib/resend";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/server";
import { variantKey } from "@/lib/variants";
import { buildCustomerOrderMessage, buildWhatsAppLink, normalizeWhatsAppNumber } from "@/lib/whatsapp";

/**
 * Checkout de invitado del marketplace: no requiere sesión. El carrito vive en
 * el cliente (localStorage) y se envía completo en cada intento de compra. El
 * precio autoritativo siempre se resuelve aquí contra la base de datos.
 *
 * Un carrito con productos de varias tiendas crea una compra (`checkouts`) y
 * un pedido (`orders`) por tienda, cada uno con su envío, cupón y método de
 * pago: cada tienda cobra y gestiona solo lo suyo.
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

/** Lo que el cliente eligió para la parte de una tienda. */
export interface CheckoutStoreChoice {
  storeId: string;
  shippingMethodId?: string | null;
  couponCode?: string | null;
  paymentMethod?: PaymentMethod | null;
  /** Cuenta a la que el cliente transferirá (solo `bank_transfer`). */
  bankAccountId?: string | null;
}

export interface CheckoutGuestInput {
  items: CheckoutGuestItem[];
  shipping: CheckoutShipping;
  notes?: string | null;
  stores: CheckoutStoreChoice[];
}

export interface CheckoutOrderResult extends PartTotals {
  orderId: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  /** Enlace wa.me para confirmar con la tienda (null si la tienda no tiene WhatsApp). */
  whatsappUrl: string | null;
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  bankAccount: BankAccountSnapshot | null;
}

export interface CheckoutResult {
  checkoutId: string;
  checkoutNumber: string;
  orders: CheckoutOrderResult[];
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
}

interface PartPlan {
  store: StoreCheckoutInfo;
  lines: ResolvedLine[];
  totals: PartTotals;
  couponId: string | null;
  shippingMethodId: string | null;
  paymentMethod: PaymentMethod;
  bankAccount: BankAccountSnapshot | null;
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  base_price_cents: number;
  cost_cents: number | null;
  is_active: boolean;
  store_id: string;
}

interface VariantRow {
  id: string;
  product_id: string;
  price_cents: number | null;
  attributes: Record<string, unknown> | null;
  is_active: boolean;
}

interface ResolvedLine {
  storeId: string;
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
    .select("id, slug, name, base_price_cents, cost_cents, is_active, store_id, moderation_status")
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
    if (
      !product ||
      !product.is_active ||
      (product as ProductRow & { moderation_status?: string }).moderation_status !== "approved"
    ) {
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
      storeId: product.store_id,
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

export async function checkoutGuest(input: CheckoutGuestInput): Promise<CheckoutResult> {
  if (input.items.length === 0) throw new Error("El carrito está vacío.");
  const name = input.shipping.name.trim();
  const email = input.shipping.email.trim();
  const phone = input.shipping.phone.trim();
  const address = input.shipping.address.trim();
  if (!name || !email || !phone || !address) {
    throw new Error("Completa nombre, correo, teléfono y dirección.");
  }

  if (!hasServiceRoleKey()) {
    console.error(
      "[checkout] Falta SUPABASE_SERVICE_ROLE_KEY en el servidor: no se pueden crear pedidos (RLS).",
    );
    throw new Error(
      "No pudimos registrar tu pedido en este momento. Inténtalo de nuevo en unos minutos.",
    );
  }

  const supabase = createServiceClient();
  const lines = await resolveLines(supabase, input.items);
  if (lines.length === 0) throw new Error("El carrito está vacío.");

  const groups = groupByStore(lines);
  const storeIds = groups.map((g) => g.storeId);
  const [storeInfo, paymentByStore] = await Promise.all([
    getStoresCheckoutInfo(storeIds),
    getCheckoutPaymentOptionsByStore(storeIds),
  ]);
  const choices = new Map((input.stores ?? []).map((s) => [s.storeId, s]));

  // 1) Validar TODAS las partes antes de escribir nada.
  const plans: PartPlan[] = [];
  for (const g of groups) {
    const store = storeInfo.get(g.storeId);
    if (!store) throw new Error("Una de las tiendas de tu carrito ya no está disponible.");
    const choice = choices.get(g.storeId);
    const options = paymentByStore[g.storeId];
    if (!options) throw new Error(`${store.name}: no tiene métodos de pago disponibles.`);

    const paymentMethod: PaymentMethod = choice?.paymentMethod ?? options.methods[0].method;
    if (!options.methods.some((m) => m.method === paymentMethod)) {
      throw new Error(`${store.name}: ese método de pago no está disponible.`);
    }
    let bankAccount: BankAccountSnapshot | null = null;
    if (paymentMethod === "bank_transfer") {
      bankAccount =
        options.bankAccounts.find((b) => b.id === choice?.bankAccountId) ??
        (options.bankAccounts.length === 1 ? options.bankAccounts[0] : null);
      if (!bankAccount) throw new Error(`${store.name}: elige el banco al que vas a transferir.`);
    }

    let discountCents = 0;
    let couponId: string | null = null;
    if (choice?.couponCode?.trim()) {
      const r = await validateCoupon(choice.couponCode, g.subtotalCents, g.storeId);
      if (!r.valid) throw new Error(`${store.name}: ${r.reason ?? "cupón no válido."}`);
      discountCents = r.discountCents ?? 0;
      couponId = r.couponId ?? null;
    }

    let shippingCents = 0;
    let shippingMethodId: string | null = null;
    if (choice?.shippingMethodId?.trim()) {
      const { data: method } = await supabase
        .from("shipping_methods")
        .select("id, price_cents, is_active, store_id")
        .eq("id", choice.shippingMethodId)
        .is("deleted_at", null)
        .maybeSingle();
      const m = method as { id: string; price_cents: number; is_active: boolean; store_id: string } | null;
      if (!m || !m.is_active || m.store_id !== g.storeId) {
        throw new Error(`${store.name}: método de envío no disponible.`);
      }
      shippingCents = resolveShippingCents(g.subtotalCents, m.price_cents, store.freeShippingMinCents ?? 0);
      shippingMethodId = m.id;
    }

    plans.push({
      store,
      lines: g.lines,
      totals: partTotal(g.subtotalCents, discountCents, shippingCents),
      couponId,
      shippingMethodId,
      paymentMethod,
      bankAccount,
    });
  }

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
  const grand = sumParts(plans.map((p) => p.totals));
  const notes = input.notes?.trim() || null;

  // 2) Compra (lo que ve el cliente).
  const { data: checkoutRow, error: checkoutErr } = await supabase
    .from("checkouts")
    .insert({
      contact_email: email,
      contact_phone: phone,
      customer_name: name,
      shipping_address: shippingAddress,
      subtotal_cents: grand.subtotalCents,
      discount_cents: grand.discountCents,
      shipping_cents: grand.shippingCents,
      total_cents: grand.totalCents,
      store_count: plans.length,
    })
    .select("id, checkout_number")
    .single();
  if (checkoutErr || !checkoutRow) {
    throw new Error(checkoutErr?.message ?? "No se pudo registrar la compra.");
  }
  const checkout = checkoutRow as { id: string; checkout_number: string };

  // 3) Un pedido por tienda.
  const orders: CheckoutOrderResult[] = [];
  for (const plan of plans) {
    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: null,
        store_id: plan.store.id,
        checkout_id: checkout.id,
        status: "pending",
        payment_status: "pending",
        subtotal_cents: plan.totals.subtotalCents,
        discount_cents: 0,
        coupon_discount_cents: plan.totals.discountCents,
        tax_cents: 0,
        shipping_cents: plan.totals.shippingCents,
        total_cents: plan.totals.totalCents,
        shipping_address: shippingAddress,
        shipping_method_id: plan.shippingMethodId,
        coupon_id: plan.couponId,
        contact_email: email,
        notes,
        payment_method: plan.paymentMethod,
        bank_account_id: plan.bankAccount?.id ?? null,
        bank_account_snapshot: plan.bankAccount,
      })
      .select("id")
      .single();
    if (orderError || !orderRow) {
      throw new Error(orderError?.message ?? "No se pudo crear el pedido.");
    }
    const orderId = (orderRow as { id: string }).id;
    const orderNumber = orderId.slice(0, 8).toUpperCase();

    const { error: itemsError } = await supabase.from("order_items").insert(
      plan.lines.map((l) => ({
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
          store_name: plan.store.name,
        },
      })),
    );
    if (itemsError) throw new Error(itemsError.message);

    // Tareas de servicio (inventario, historial, cupón). Best-effort.
    for (const l of plan.lines) {
      if (l.variantId) await reserveInventory(supabase, l.variantId, l.quantity);
    }
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: "pending",
      changed_by: null,
      note: "Pedido creado (invitado)",
    });
    if (plan.couponId) await incrementCouponUsage(plan.couponId);

    const paymentLabel = paymentMethodLabel(plan.paymentMethod);

    // Aviso a la tienda (best-effort: nunca revierte el pedido).
    if (plan.store.notificationEmail) {
      try {
        const addressParts = [
          shippingAddress.address_line1,
          shippingAddress.address_line2,
          shippingAddress.city,
          shippingAddress.state,
        ].filter((p): p is string => Boolean(p?.trim()));
        await sendNewOrderAdminEmail(plan.store.notificationEmail, {
          orderNumber,
          orderId,
          panelBase: "/panel",
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          shippingAddress: addressParts.length ? addressParts.join(", ") : null,
          items: plan.lines.map((l) => ({
            name: l.productName,
            quantity: l.quantity,
            size: l.size,
            color: l.color,
            unitPrice: l.unitPriceCents,
          })),
          subtotal: plan.totals.subtotalCents,
          shipping: plan.totals.shippingCents,
          discount: plan.totals.discountCents,
          total: plan.totals.totalCents,
          currency: "DOP",
          paymentMethod: paymentLabel,
          bankAccount: plan.bankAccount
            ? `${plan.bankAccount.bankName} · ${plan.bankAccount.accountType} ${plan.bankAccount.accountNumber}`
            : null,
          notes,
        });
      } catch {
        // Silencioso: el aviso nunca debe tumbar el checkout del cliente.
      }
    }

    // WhatsApp de la tienda para que el cliente confirme (best-effort).
    let whatsappUrl: string | null = null;
    if (plan.store.whatsapp) {
      whatsappUrl = buildWhatsAppLink(
        normalizeWhatsAppNumber(plan.store.whatsapp),
        buildCustomerOrderMessage({
          orderNumber,
          customerName: name,
          storeName: plan.store.name,
          items: plan.lines.map((l) => ({ name: l.productName, quantity: l.quantity, size: l.size })),
          totalCents: plan.totals.totalCents,
          paymentMethod: paymentLabel,
          bankName: plan.bankAccount?.bankName ?? null,
        }),
      );
    }

    orders.push({
      orderId,
      orderNumber,
      storeId: plan.store.id,
      storeName: plan.store.name,
      storeSlug: plan.store.slug,
      ...plan.totals,
      whatsappUrl,
      paymentMethod: plan.paymentMethod,
      paymentMethodLabel: paymentLabel,
      bankAccount: plan.bankAccount,
    });
  }

  return {
    checkoutId: checkout.id,
    checkoutNumber: checkout.checkout_number,
    orders,
    subtotalCents: grand.subtotalCents,
    discountCents: grand.discountCents,
    shippingCents: grand.shippingCents,
    taxCents: 0,
    totalCents: grand.totalCents,
  };
}
