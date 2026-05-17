import { createClient, createServiceClient } from "@/lib/supabase/server";

export interface SizePresetRow {
  id: string;
  name: string;
  sizes: string[];
  sort_order: number;
}

function isSchemaCacheError(e: { code?: string; message?: string }): boolean {
  const msg = (e.message ?? "").toLowerCase();
  return (
    e.code === "PGRST204" ||
    msg.includes("schema cache") ||
    msg.includes("could not find")
  );
}

export async function getSizePresetsForAdmin(): Promise<SizePresetRow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("size_presets")
    .select("id, name, sizes, sort_order")
    .order("sort_order", { ascending: true });
  if (!error) return (data ?? []) as SizePresetRow[];
  if (isSchemaCacheError(error)) return [];
  throw new Error(error.message);
}

export async function getSizePresetById(
  id: string,
): Promise<SizePresetRow | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("size_presets")
    .select("id, name, sizes, sort_order")
    .eq("id", id)
    .maybeSingle();
  if (!error) return (data ?? null) as SizePresetRow | null;
  if (isSchemaCacheError(error)) return null;
  throw new Error(error.message);
}

export async function getSizePresetsPublic(): Promise<SizePresetRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("size_presets")
    .select("id, name, sizes, sort_order")
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []) as SizePresetRow[];
}
