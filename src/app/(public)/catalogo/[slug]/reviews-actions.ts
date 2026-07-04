"use server";

import { revalidatePath } from "next/cache";
import { deleteReview, upsertReview } from "@/database/repositories/reviews";

export type ReviewActionResult = { ok: true } | { ok: false; error: string };

/**
 * Crea/actualiza la reseña del usuario. Delega en la capa de datos, que además
 * marca la compra verificada y recalcula `rating_avg`/`review_count` del producto.
 */
export async function submitReviewAction(
  productId: string,
  productSlug: string,
  rating: number,
  title: string,
  body: string,
): Promise<ReviewActionResult> {
  if (rating < 1 || rating > 5) {
    return { ok: false, error: "Calificación inválida." };
  }
  try {
    await upsertReview({ productId, rating, title, body });
    revalidatePath(`/catalogo/${productSlug}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo guardar la reseña.",
    };
  }
}

export async function deleteReviewAction(
  productId: string,
  productSlug: string,
): Promise<ReviewActionResult> {
  try {
    await deleteReview(productId);
    revalidatePath(`/catalogo/${productSlug}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo eliminar la reseña.",
    };
  }
}
