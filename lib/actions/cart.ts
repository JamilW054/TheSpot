"use server";

import { revalidatePath } from "next/cache";
import {
  type AddToCartInput,
  type CartLine,
  addToCart as dbAddToCart,
  clearCart as dbClearCart,
  mergeGuestCart as dbMergeGuestCart,
  removeCartItem as dbRemoveCartItem,
  setCartItemQuantity as dbSetCartItemQuantity,
  setSavedForLater as dbSetSavedForLater,
  type GuestCartItem,
  getCart,
} from "@/lib/db/cart";

export type CartActionState = { ok?: true; error?: string };

/** Devuelve las líneas del carrito persistente (para hidratar el cliente). */
export async function getCartLinesAction(): Promise<CartLine[]> {
  try {
    return await getCart();
  } catch {
    return [];
  }
}

function ok(): CartActionState {
  return { ok: true };
}
function fail(e: unknown): CartActionState {
  return { error: e instanceof Error ? e.message : "Error inesperado." };
}

function revalidateCart() {
  revalidatePath("/carrito");
  revalidatePath("/cuenta");
}

export async function addToCartAction(
  input: AddToCartInput,
): Promise<CartActionState> {
  try {
    await dbAddToCart(input);
    revalidateCart();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function updateCartQuantityAction(
  itemId: string,
  quantity: number,
): Promise<CartActionState> {
  try {
    await dbSetCartItemQuantity(itemId, quantity);
    revalidateCart();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function removeCartItemAction(
  itemId: string,
): Promise<CartActionState> {
  try {
    await dbRemoveCartItem(itemId);
    revalidateCart();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function clearCartAction(
  includeSaved = false,
): Promise<CartActionState> {
  try {
    await dbClearCart(includeSaved);
    revalidateCart();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function saveForLaterAction(
  itemId: string,
  saved: boolean,
): Promise<CartActionState> {
  try {
    await dbSetSavedForLater(itemId, saved);
    revalidateCart();
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function mergeGuestCartAction(
  items: GuestCartItem[],
): Promise<CartActionState & { merged?: number }> {
  try {
    const merged = await dbMergeGuestCart(items);
    revalidateCart();
    return { ok: true, merged };
  } catch (e) {
    return fail(e);
  }
}
