"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ReviewActionResult = { ok: true } | { ok: false; error: string };

export async function submitReviewAction(
  productId: string,
  productSlug: string,
  rating: number,
  body: string,
): Promise<ReviewActionResult> {
  if (rating < 1 || rating > 5) {
    return { ok: false, error: "Calificación inválida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Debes iniciar sesión para dejar una reseña." };
  }

  const trimmedBody = body.trim() || null;

  // El esquema nuevo no tiene índice único (product_id,user_id): upsert manual.
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("reviews")
        .update({ rating, body: trimmedBody })
        .eq("id", (existing as { id: string }).id)
    : await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user.id,
        rating,
        body: trimmedBody,
      });

  if (error) {
    return {
      ok: false,
      error: "No se pudo guardar la reseña. Intenta de nuevo.",
    };
  }

  revalidatePath(`/catalogo/${productSlug}`);
  return { ok: true };
}

export async function deleteReviewAction(
  productId: string,
  productSlug: string,
): Promise<ReviewActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "No autenticado." };
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "No se pudo eliminar la reseña." };
  }

  revalidatePath(`/catalogo/${productSlug}`);
  return { ok: true };
}
