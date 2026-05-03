import { createServiceClient } from "@/lib/supabase/server";

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
}

export async function getCategoriesForAdmin(): Promise<CategoryRow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as CategoryRow[];
}
