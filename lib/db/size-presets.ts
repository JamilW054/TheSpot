import { createClient, createServiceClient } from "@/lib/supabase/server";

/** Item de un preset: etiqueta + hex (hex solo aplica a presets de color). */
export interface SizePresetItem {
  label: string;
  hex: string | null;
}

export interface SizePresetRow {
  id: string;
  name: string;
  /** Tipo de eje: tallas o colores. */
  kind: "size" | "color";
  /** Derivado de `size_preset_items` (label ordenado por sort_order). */
  sizes: string[];
  /** Items con hex (para colores). Para tallas el hex es null. */
  items: SizePresetItem[];
  /** El esquema nuevo no tiene orden en presets; se conserva por compatibilidad. */
  sort_order: number;
}

type AnyClient = ReturnType<typeof createServiceClient>;

interface PresetRow {
  id: string;
  name: string;
  kind?: string | null;
}
interface ItemRow {
  preset_id: string;
  label: string;
  sort_order: number | null;
  swatch_hex?: string | null;
}

/**
 * Carga presets + sus items en DOS consultas separadas (sin el embed por FK), de
 * modo que no dependemos de que el caché de esquema de PostgREST conozca la
 * relación size_presets→size_preset_items. Reintenta sin las columnas nuevas
 * (`kind`, `swatch_hex`) por si el caché aún no las tiene tras la migración 00015.
 */
async function queryPresets(
  supabase: AnyClient,
  select: string,
  id?: string,
): Promise<{ data: PresetRow[] | null; error: { message: string } | null }> {
  const base = supabase.from("size_presets").select(select);
  const query = id ? base.eq("id", id) : base.order("name", { ascending: true });
  const { data, error } = await query;
  return { data: data as PresetRow[] | null, error };
}

async function loadPresets(
  supabase: AnyClient,
  id?: string,
): Promise<SizePresetRow[]> {
  // 1) Presets (con kind; si falla, sin kind).
  let { data: presetData, error } = await queryPresets(
    supabase,
    "id, name, kind",
    id,
  );
  if (error) {
    console.error("[size-presets] presets+kind:", error.message);
    ({ data: presetData, error } = await queryPresets(supabase, "id, name", id));
    if (error) {
      console.error("[size-presets] presets:", error.message);
      return [];
    }
  }
  const presets = presetData ?? [];
  if (presets.length === 0) return [];

  // 2) Items de esos presets (con swatch_hex; si falla, sin él).
  const ids = presets.map((p) => p.id);
  let itemData: ItemRow[] | null = null;
  {
    const res = await supabase
      .from("size_preset_items")
      .select("preset_id, label, sort_order, swatch_hex")
      .in("preset_id", ids);
    if (res.error) {
      console.error("[size-presets] items+hex:", res.error.message);
      const retry = await supabase
        .from("size_preset_items")
        .select("preset_id, label, sort_order")
        .in("preset_id", ids);
      if (retry.error) console.error("[size-presets] items:", retry.error.message);
      itemData = (retry.data as ItemRow[] | null) ?? null;
    } else {
      itemData = res.data as ItemRow[] | null;
    }
  }
  const itemsByPreset = new Map<string, ItemRow[]>();
  for (const it of itemData ?? []) {
    const arr = itemsByPreset.get(it.preset_id) ?? [];
    arr.push(it);
    itemsByPreset.set(it.preset_id, arr);
  }

  return presets.map((p) => {
    const sorted = [...(itemsByPreset.get(p.id) ?? [])].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );
    const items: SizePresetItem[] = sorted
      .filter((i) => i.label)
      .map((i) => ({ label: i.label, hex: i.swatch_hex ?? null }));
    return {
      id: p.id,
      name: p.name,
      kind: p.kind === "color" ? "color" : "size",
      sizes: items.map((i) => i.label),
      items,
      sort_order: 0,
    };
  });
}

export async function getSizePresetsForAdmin(): Promise<SizePresetRow[]> {
  try {
    return await loadPresets(createServiceClient() as unknown as AnyClient);
  } catch (e) {
    console.error("[getSizePresetsForAdmin]", e);
    return [];
  }
}

export async function getSizePresetById(
  id: string,
): Promise<SizePresetRow | null> {
  const rows = await loadPresets(
    createServiceClient() as unknown as AnyClient,
    id,
  );
  return rows[0] ?? null;
}

export async function getSizePresetsPublic(): Promise<SizePresetRow[]> {
  try {
    const supabase = (await createClient()) as unknown as AnyClient;
    return await loadPresets(supabase);
  } catch (e) {
    console.error("[getSizePresetsPublic]", e);
    return [];
  }
}
