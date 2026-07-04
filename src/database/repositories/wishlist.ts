import { createClient } from "@/lib/supabase/server";

/**
 * Lista de deseos persistente respaldada por `wishlists` + `wishlist_items`.
 *
 * Cada usuario tiene una lista por defecto ("Mi lista"). El índice único
 * `(wishlist_id, product_id)` impide duplicados. Las operaciones aseguran la
 * existencia de la lista por defecto antes de mutar.
 */

export interface WishlistEntry {
  itemId: string;
  productId: string;
  variantId: string | null;
  addedAt: string;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  return { supabase, userId: user.id };
}

/** Devuelve (creándola si hace falta) la lista de deseos por defecto del usuario. */
export async function ensureDefaultWishlist(): Promise<string> {
  const { supabase, userId } = await requireUser();
  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existing) return (existing as { id: string }).id;

  const { data, error } = await supabase
    .from("wishlists")
    .insert({ user_id: userId, name: "Mi lista" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

/** IDs de productos en la lista de deseos del usuario (vacío si no hay sesión). */
export async function getWishlistProductIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: lists } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null);
  const ids = (lists ?? []).map((l) => (l as { id: string }).id);
  if (ids.length === 0) return [];

  const { data: items } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .in("wishlist_id", ids);
  return (items ?? []).map((i) => (i as { product_id: string }).product_id);
}

/** Entradas de la lista de deseos con metadatos (id de línea, fecha, variante). */
export async function getWishlistEntries(): Promise<WishlistEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: lists } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null);
  const listIds = (lists ?? []).map((l) => (l as { id: string }).id);
  if (listIds.length === 0) return [];

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id, product_id, variant_id, added_at")
    .in("wishlist_id", listIds)
    .order("added_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map((row) => {
    const r = row as {
      id: string;
      product_id: string;
      variant_id: string | null;
      added_at: string;
    };
    return {
      itemId: r.id,
      productId: r.product_id,
      variantId: r.variant_id,
      addedAt: r.added_at,
    };
  });
}

/** Añade un producto a la lista de deseos (idempotente). */
export async function addToWishlist(
  productId: string,
  variantId: string | null = null,
): Promise<void> {
  const { supabase } = await requireUser();
  const wishlistId = await ensureDefaultWishlist();
  const { error } = await supabase.from("wishlist_items").upsert(
    {
      wishlist_id: wishlistId,
      product_id: productId,
      variant_id: variantId,
    },
    { onConflict: "wishlist_id,product_id", ignoreDuplicates: true },
  );
  if (error) throw new Error(error.message);
}

/** Elimina un producto de todas las listas del usuario. */
export async function removeFromWishlist(productId: string): Promise<void> {
  const { supabase, userId } = await requireUser();
  const { data: lists } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .is("deleted_at", null);
  const listIds = (lists ?? []).map((l) => (l as { id: string }).id);
  if (listIds.length === 0) return;
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .in("wishlist_id", listIds)
    .eq("product_id", productId);
  if (error) throw new Error(error.message);
}

/** Alterna un producto en la lista. Devuelve true si quedó añadido. */
export async function toggleWishlist(productId: string): Promise<boolean> {
  const ids = await getWishlistProductIds();
  if (ids.includes(productId)) {
    await removeFromWishlist(productId);
    return false;
  }
  await addToWishlist(productId);
  return true;
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const ids = await getWishlistProductIds();
  return ids.includes(productId);
}
