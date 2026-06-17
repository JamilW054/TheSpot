"use server";

import { revalidatePath } from "next/cache";
import {
  addToWishlist as dbAddToWishlist,
  removeFromWishlist as dbRemoveFromWishlist,
  toggleWishlist as dbToggleWishlist,
  getWishlistEntries,
  type WishlistEntry,
} from "@/lib/db/wishlist";

export type WishlistActionState = {
  ok?: true;
  error?: string;
  inWishlist?: boolean;
};

/** Entradas de la lista de deseos del usuario (para hidratar el cliente). */
export async function getWishlistEntriesAction(): Promise<WishlistEntry[]> {
  try {
    return await getWishlistEntries();
  } catch {
    return [];
  }
}

/** Fusiona la lista de invitado (localStorage) en la BD tras iniciar sesión. */
export async function mergeGuestWishlistAction(
  productIds: string[],
): Promise<WishlistActionState> {
  try {
    for (const id of productIds) {
      try {
        await dbAddToWishlist(id);
      } catch {
        // Ignorar productos inválidos/eliminados.
      }
    }
    revalidateWishlist();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

function revalidateWishlist() {
  revalidatePath("/wishlist");
  revalidatePath("/cuenta/wishlist");
}

function fail(e: unknown): WishlistActionState {
  return { error: e instanceof Error ? e.message : "Error inesperado." };
}

export async function addToWishlistAction(
  productId: string,
): Promise<WishlistActionState> {
  try {
    await dbAddToWishlist(productId);
    revalidateWishlist();
    return { ok: true, inWishlist: true };
  } catch (e) {
    return fail(e);
  }
}

export async function removeFromWishlistAction(
  productId: string,
): Promise<WishlistActionState> {
  try {
    await dbRemoveFromWishlist(productId);
    revalidateWishlist();
    return { ok: true, inWishlist: false };
  } catch (e) {
    return fail(e);
  }
}

export async function toggleWishlistAction(
  productId: string,
): Promise<WishlistActionState> {
  try {
    const inWishlist = await dbToggleWishlist(productId);
    revalidateWishlist();
    return { ok: true, inWishlist };
  } catch (e) {
    return fail(e);
  }
}
