import { createClient, createServiceClient } from "@/lib/supabase/server";

export interface SizePresetRow {
  id: string;
  name: string;
  /** Derivado de `size_preset_items` (label ordenado por sort_order). */
  sizes: string[];
  /** El esquema nuevo no tiene orden en presets; se conserva por compatibilidad. */
  sort_order: number;
}

interface SizePresetItemJoin {
  label: string;
  sort_order: number | null;
}

const PRESET_SELECT = "id, name, size_preset_items(label, sort_order)";

function isSchemaCacheError(e: { code?: string; message?: string }): boolean {
  const msg = (e.message ?? "").toLowerCase();
  return (
    e.code === "PGRST204" ||
    msg.includes("schema cache") ||
    msg.includes("could not find")
  );
}

function rowToPreset(row: {
  id: string;
  name: string;
  size_preset_items?: SizePresetItemJoin[] | null;
}): SizePresetRow {
  const items = [...(row.size_preset_items ?? [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );
  return {
    id: row.id,
    name: row.name,
    sizes: items.map((i) => i.label).filter(Boolean),
    sort_order: 0,
  };
}

export async function getSizePresetsForAdmin(): Promise<SizePresetRow[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("size_presets")
      .select(PRESET_SELECT)
      .is("deleted_at", null)
      .order("name", { ascending: true });
    if (!error)
      return (data ?? []).map((r: unknown) =>
        rowToPreset(r as Parameters<typeof rowToPreset>[0]),
      );
    if (isSchemaCacheError(error)) return [];
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
    .select(PRESET_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (!error)
    return data ? rowToPreset(data as Parameters<typeof rowToPreset>[0]) : null;
  if (isSchemaCacheError(error)) return null;
  throw new Error(error.message);
}

export async function getSizePresetsPublic(): Promise<SizePresetRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("size_presets")
    .select(PRESET_SELECT)
    .is("deleted_at", null)
    .order("name", { ascending: true });
  if (error) return [];
  return (data ?? []).map((r: unknown) =>
    rowToPreset(r as Parameters<typeof rowToPreset>[0]),
  );
}
