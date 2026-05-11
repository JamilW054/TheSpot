import { createClient } from "@/lib/supabase/server";
import type { ProductReview } from "@/types";

export interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  body: string | null;
  created_at: string;
  profiles: { name: string | null } | null;
}

export function rowToReview(row: ReviewRow): ProductReview {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    userName: row.profiles?.name ?? null,
    rating: row.rating,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function getProductReviews(
  productId: string,
): Promise<ProductReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, product_id, user_id, rating, body, created_at, profiles(name)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) return [];
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
    .from("product_reviews")
    .select("id, product_id, user_id, rating, body, created_at, profiles(name)")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToReview(data as ReviewRow);
}
