import { createClient } from "@/lib/supabase/server";
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

const REVIEW_SELECT = "id, product_id, user_id, rating, title, body, created_at";

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
