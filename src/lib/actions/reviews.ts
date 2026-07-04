"use server";

import { revalidatePath } from "next/cache";
import {
  deleteReview as dbDeleteReview,
  upsertReview as dbUpsertReview,
  type ReviewInput,
} from "@/database/repositories/reviews";

export type ReviewActionState = { ok?: true; error?: string };

function fail(e: unknown): ReviewActionState {
  return { error: e instanceof Error ? e.message : "Error inesperado." };
}

export async function submitReviewAction(
  input: ReviewInput & { productSlug?: string },
): Promise<ReviewActionState> {
  try {
    if (!input.rating || input.rating < 1 || input.rating > 5) {
      throw new Error("Selecciona una valoración de 1 a 5 estrellas.");
    }
    await dbUpsertReview(input);
    if (input.productSlug) revalidatePath(`/catalogo/${input.productSlug}`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteReviewAction(
  productId: string,
  productSlug?: string,
): Promise<ReviewActionState> {
  try {
    await dbDeleteReview(productId);
    if (productSlug) revalidatePath(`/catalogo/${productSlug}`);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
