import { createClient, createServiceClient } from "@/lib/supabase/server";

export interface SizePresetRow {
  id: string;
  name: string;
}

export async function getSizePresetsForAdmin(): Promise<SizePresetRow[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("size_presets")
      .select("id, name")
      .order("name", { ascending: true });
    if (!error) return (data ?? []) as SizePresetRow[];
    console.error("[getSizePresetsForAdmin]", error.message);
    return [];
  } catch (e) {
    console.error("[getSizePresetsForAdmin]", e);
    return [];
  }
}

export async function getSizePresetById(
  id: string,
): Promise<SizePresetRow | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("size_presets")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();
  if (!error) return (data ?? null) as SizePresetRow | null;
  throw new Error(error.message);
}

export async function getSizePresetsPublic(): Promise<SizePresetRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("size_presets")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) return [];
  return (data ?? []) as SizePresetRow[];
}
