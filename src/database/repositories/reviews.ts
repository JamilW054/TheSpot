import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { ProductReview } from "@/types";

export interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
}

export function rowToReview(row: ReviewRow): ProductReview {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    userName: null,
    rating: row.rating,
    title: row.title ?? null,
    body: row.body ?? null,
    createdAt: row.created_at,
  };
}

const REVIEW_SELECT =
  "id, product_id, user_id, rating, title, body, created_at";

export async function getProductReviews(
  productId: string,
): Promise<ProductReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("product_id", productId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[getProductReviews]", error.message);
    return [];
  }
  return (data ?? []).map((row) => rowToReview(row as ReviewRow));
}

/** Returns the current user's review for a product, or null. */
export async function getUserReviewForProduct(
  productId: string,
): Promise<ProductReview | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) {
    console.error("[getUserReviewForProduct]", error.message);
    return null;
  }
  if (!data) return null;
  return rowToReview(data as ReviewRow);
}

/** Recalcula `rating_avg` y `review_count` del producto (service role). */
export async function recomputeProductRating(productId: string): Promise<void> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .is("deleted_at", null);
  const ratings = ((data ?? []) as { rating: number }[]).map((r) => r.rating);
  const count = ratings.length;
  const avg =
    count === 0
      ? 0
      : Math.round(
          (ratings.reduce((s: number, r: number) => s + r, 0) / count) * 100,
        ) / 100;
  await supabase
    .from("products")
    .update({
      rating_avg: avg,
      review_count: count,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);
}

/** True si el usuario tiene un pedido con un ítem de este producto (compra verificada). */
async function findVerifiedOrderItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  productId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("order_items")
    .select("id, orders!inner(user_id), product_variants!inner(product_id)")
    .eq("orders.user_id", userId)
    .eq("product_variants.product_id", productId)
    .limit(1)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export interface ReviewInput {
  productId: string;
  rating: number;
  title?: string | null;
  body?: string | null;
}

/**
 * Crea o actualiza la reseña del usuario para un producto (una por usuario).
 * Marca `is_verified` si existe una compra previa y recalcula el rating.
 */
export async function upsertReview(input: ReviewInput): Promise<ProductReview> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión.");

  const rating = Math.max(1, Math.min(5, Math.round(input.rating)));
  const title = input.title?.trim() || null;
  const body = input.body?.trim() || null;

  const orderItemId = await findVerifiedOrderItem(
    supabase,
    user.id,
    input.productId,
  );

  const existing = await getUserReviewForProduct(input.productId);

  let saved: ReviewRow;
  if (existing) {
    const { data, error } = await supabase
      .from("reviews")
      .update({
        rating,
        title,
        body,
        is_verified: orderItemId != null,
        order_item_id: orderItemId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select(REVIEW_SELECT)
      .single();
    if (error) throw new Error(error.message);
    saved = data as ReviewRow;
  } else {
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        product_id: input.productId,
        rating,
        title,
        body,
        is_verified: orderItemId != null,
        order_item_id: orderItemId,
      })
      .select(REVIEW_SELECT)
      .single();
    if (error) throw new Error(error.message);
    saved = data as ReviewRow;
  }

  await recomputeProductRating(input.productId);
  return rowToReview(saved);
}

/** Borra (lógicamente) la reseña del usuario para un producto y recalcula. */
export async function deleteReview(productId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión.");

  const { error } = await supabase
    .from("reviews")
    .update({ deleted_at: new Date().toISOString() })
    .eq("product_id", productId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  await recomputeProductRating(productId);
}
