import { createClient } from "@/lib/supabase/server";

/**
 * Carrito persistente respaldado por la tabla `cart_items`.
 *
 * Cada línea referencia una variante (`variant_id`) y, opcionalmente, un diseño
 * personalizado (`design_id`). El precio unitario se congela en
 * `unit_price_cents` al añadir, tomando el precio de la variante o, en su
 * defecto, el `base_price_cents` del producto.
 *
 * El índice único `(user_id, variant_id, design_id)` garantiza una sola línea
 * por combinación: añadir de nuevo incrementa la cantidad.
 */

/** Línea del carrito con datos del producto/variante resueltos para mostrar. */
export interface CartLine {
  id: string;
  variantId: string;
  designId: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  savedForLater: boolean;
  productId: string;
  productName: string;
  productSlug: string;
  coverImage: string | null;
  /** Talla u otros atributos de la variante (ej. { size: "M", color: "Rojo" }). */
  attributes: Record<string, unknown>;
  size: string | null;
  color: string | null;
  /** Hex del color elegido (para el swatch), si la variante lo tiene. */
  colorHex: string | null;
  designName: string | null;
  designThumbnail: string | null;
  createdAt: string;
}

interface CartItemRow {
  id: string;
  variant_id: string;
  design_id: string | null;
  quantity: number;
  unit_price_cents: number;
  saved_for_later: boolean;
  created_at: string;
  product_variants: {
    id: string;
    price_cents: number | null;
    attributes: Record<string, unknown> | null;
    products: {
      id: string;
      slug: string;
      name: string;
      product_media: { url: string; is_cover: boolean }[] | null;
    } | null;
  } | null;
  designs: {
    name: string | null;
    thumbnail_url: string | null;
    preview_url: string | null;
  } | null;
}

const CART_SELECT =
  "id, variant_id, design_id, quantity, unit_price_cents, saved_for_later, created_at, " +
  "product_variants(id, price_cents, attributes, products(id, slug, name, product_media(url, is_cover))), " +
  "designs(name, thumbnail_url, preview_url)";

function coverFromMedia(
  media: { url: string; is_cover: boolean }[] | null | undefined,
): string | null {
  const list = media ?? [];
  return list.find((m) => m.is_cover)?.url ?? list[0]?.url ?? null;
}

function rowToCartLine(row: CartItemRow): CartLine {
  const variant = row.product_variants;
  const product = variant?.products ?? null;
  const attributes = (variant?.attributes ?? {}) as Record<string, unknown>;
  const size =
    typeof attributes.size === "string" ? (attributes.size as string) : null;
  const color =
    typeof attributes.color === "string" ? (attributes.color as string) : null;
  const colorHex =
    typeof attributes.hex === "string" ? (attributes.hex as string) : null;
  return {
    id: row.id,
    variantId: row.variant_id,
    designId: row.design_id,
    quantity: row.quantity,
    unitPriceCents: row.unit_price_cents,
    lineTotalCents: row.unit_price_cents * row.quantity,
    savedForLater: row.saved_for_later,
    productId: product?.id ?? "",
    productName: product?.name ?? "Producto",
    productSlug: product?.slug ?? "",
    coverImage: coverFromMedia(product?.product_media),
    attributes,
    size,
    color,
    colorHex,
    designName: row.designs?.name ?? null,
    designThumbnail:
      row.designs?.thumbnail_url ?? row.designs?.preview_url ?? null,
    createdAt: row.created_at,
  };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  return { supabase, userId: user.id };
}

/**
 * Resuelve la variante para un producto + talla + color. Casa por ambos ejes
 * (los presentes); si no coincide ninguna, devuelve la primera variante activa.
 * Lanza si el producto no tiene variantes.
 */
export async function resolveVariant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  size: string | null,
  color: string | null,
): Promise<{ variantId: string; priceCents: number }> {
  const { data: variantData } = await supabase
    .from("product_variants")
    .select("id, price_cents, attributes")
    .eq("product_id", productId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  const variants = (variantData ?? []) as unknown as {
    id: string;
    price_cents: number | null;
    attributes: Record<string, unknown> | null;
  }[];

  const { data: productData } = await supabase
    .from("products")
    .select("base_price_cents")
    .eq("id", productId)
    .maybeSingle();
  const basePrice = Math.round(
    Number(
      (productData as { base_price_cents?: number } | null)?.base_price_cents ??
        0,
    ),
  );

  if (variants.length === 0) {
    throw new Error("El producto no tiene variantes disponibles.");
  }

  const wantSize = size?.trim().toLowerCase() ?? "";
  const wantColor = color?.trim().toLowerCase() ?? "";
  const attrStr = (attrs: Record<string, unknown> | null, key: string) =>
    typeof attrs?.[key] === "string"
      ? (attrs[key] as string).toLowerCase()
      : "";
  // Casa por los ejes solicitados (talla y/o color); ignora los no especificados.
  const match =
    wantSize || wantColor
      ? variants.find(
          (v) =>
            (!wantSize || attrStr(v.attributes, "size") === wantSize) &&
            (!wantColor || attrStr(v.attributes, "color") === wantColor),
        )
      : undefined;
  const chosen = match ?? variants[0];
  return { variantId: chosen.id, priceCents: chosen.price_cents ?? basePrice };
}

/** Líneas del carrito activas (no guardadas para después) del usuario actual. */
export async function getCart(): Promise<CartLine[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Sin sesión no hay carrito persistente (los invitados usan localStorage).
  if (!user) return [];
  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    // Filtrar explícitamente por el dueño: no depender solo de RLS, y así lo que
    // se muestra coincide exactamente con lo que se puede borrar (mismo user_id).
    .eq("user_id", user.id)
    .eq("saved_for_later", false)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []).map((row) =>
    rowToCartLine(row as unknown as CartItemRow),
  );
}

/** Líneas guardadas para después. */
export async function getSavedForLater(): Promise<CartLine[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    .eq("saved_for_later", true)
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []).map((row) =>
    rowToCartLine(row as unknown as CartItemRow),
  );
}

/** Número total de unidades en el carrito activo. */
export async function getCartCount(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("saved_for_later", false);
  if (error) return 0;
  return (data ?? []).reduce(
    (sum, row) => sum + ((row as { quantity: number }).quantity ?? 0),
    0,
  );
}

export interface AddToCartInput {
  productId?: string;
  variantId?: string;
  size?: string | null;
  color?: string | null;
  designId?: string | null;
  quantity?: number;
}

/**
 * Añade un producto al carrito. Acepta `variantId` directo o `productId` + talla.
 * Si la línea ya existe (misma variante + diseño), incrementa la cantidad.
 */
export async function addToCart(input: AddToCartInput): Promise<CartLine> {
  const { supabase, userId } = await requireUser();
  const quantity = Math.max(1, Math.floor(input.quantity ?? 1));
  const designId = input.designId ?? null;

  let variantId = input.variantId ?? null;
  let unitPriceCents: number | null = null;
  if (!variantId) {
    if (!input.productId) throw new Error("Falta el producto.");
    const resolved = await resolveVariant(
      supabase,
      input.productId,
      input.size ?? null,
      input.color ?? null,
    );
    variantId = resolved.variantId;
    unitPriceCents = resolved.priceCents;
  } else {
    const { data: v } = await supabase
      .from("product_variants")
      .select("price_cents, product_id, products(base_price_cents)")
      .eq("id", variantId)
      .maybeSingle();
    const row = v as unknown as {
      price_cents: number | null;
      products: { base_price_cents: number } | null;
    } | null;
    unitPriceCents = Math.round(
      Number(row?.price_cents ?? row?.products?.base_price_cents ?? 0),
    );
  }

  // Línea existente (índice único user_id+variant_id+design_id). Hay que tratar
  // el NULL de design_id explícitamente (PostgREST: `is` vs `eq`).
  let lookup = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("variant_id", variantId);
  lookup =
    designId === null
      ? lookup.is("design_id", null)
      : lookup.eq("design_id", designId);
  const { data: existing } = await lookup.maybeSingle();
  const existingRow = existing as { id: string; quantity: number } | null;

  if (existingRow) {
    const { data, error } = await supabase
      .from("cart_items")
      .update({
        quantity: existingRow.quantity + quantity,
        saved_for_later: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingRow.id)
      .select(CART_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return rowToCartLine(data as unknown as CartItemRow);
  }

  const { data, error } = await supabase
    .from("cart_items")
    .insert({
      user_id: userId,
      variant_id: variantId,
      design_id: designId,
      quantity,
      unit_price_cents: unitPriceCents ?? 0,
    })
    .select(CART_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return rowToCartLine(data as unknown as CartItemRow);
}

/** Fija la cantidad de una línea. Si llega a 0, la elimina. */
export async function setCartItemQuantity(
  itemId: string,
  quantity: number,
): Promise<void> {
  const { supabase, userId } = await requireUser();
  const qty = Math.floor(quantity);
  if (qty <= 0) {
    await removeCartItem(itemId);
    return;
  }
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: qty, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

/** Elimina una línea del carrito. Confirma que la fila se borró de verdad. */
export async function removeCartItem(itemId: string): Promise<void> {
  const { supabase, userId } = await requireUser();
  // `.select()` devuelve las filas borradas: si está vacío, el DELETE no afectó
  // nada (RLS bloqueó, user_id no coincide, o la fila ya no existe). Lanzamos en
  // vez de devolver "ok" falso —así el bug "se borra pero reaparece" sale a la luz.
  const { data, error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId)
    .select("id");
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error(
      "No se pudo eliminar el artículo del carrito (sin permiso o no existe).",
    );
  }
}

/** Vacía el carrito activo del usuario (no toca "guardado para después"). */
export async function clearCart(includeSaved = false): Promise<void> {
  const { supabase, userId } = await requireUser();
  let q = supabase.from("cart_items").delete().eq("user_id", userId);
  if (!includeSaved) q = q.eq("saved_for_later", false);
  const { error } = await q;
  if (error) throw new Error(error.message);
}

/** Mueve una línea a/desde "guardado para después". */
export async function setSavedForLater(
  itemId: string,
  saved: boolean,
): Promise<void> {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("cart_items")
    .update({ saved_for_later: saved, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export interface GuestCartItem {
  productId?: string;
  variantId?: string;
  size?: string | null;
  color?: string | null;
  designId?: string | null;
  quantity?: number;
}

/**
 * Fusiona un carrito de invitado (localStorage) en el carrito persistente tras
 * iniciar sesión. Ignora líneas que no se puedan resolver.
 */
export async function mergeGuestCart(items: GuestCartItem[]): Promise<number> {
  let merged = 0;
  for (const item of items) {
    try {
      await addToCart(item);
      merged++;
    } catch {
      // Saltar líneas inválidas (producto agotado/eliminado, etc.).
    }
  }
  return merged;
}
