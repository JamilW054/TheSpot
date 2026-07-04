"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/server";

export type SizePresetActionState = { ok?: true; error?: string };

interface PresetItem {
  label: string;
  hex: string | null;
}

/**
 * Lee los items del preset desde el formulario. Para color se envía `items_json`
 * (`[{label, hex}]`, hex del color picker); para talla se mantiene `sizes` como
 * texto separado por comas. Devuelve el tipo (kind) y los items normalizados.
 */
function parsePresetInput(formData: FormData): {
  kind: "size" | "color";
  items: PresetItem[];
} {
  const kind = formData.get("kind") === "color" ? "color" : "size";
  const itemsRaw = formData.get("items_json")?.toString();
  if (itemsRaw) {
    try {
      const parsed = JSON.parse(itemsRaw);
      if (Array.isArray(parsed)) {
        const seen = new Set<string>();
        const items: PresetItem[] = [];
        for (const it of parsed) {
          if (typeof it !== "object" || it == null) continue;
          const rec = it as Record<string, unknown>;
          const label =
            typeof rec.label === "string" ? rec.label.trim() : "";
          if (!label || seen.has(label.toLowerCase())) continue;
          seen.add(label.toLowerCase());
          const hex =
            kind === "color" && typeof rec.hex === "string" ? rec.hex : null;
          items.push({ label, hex });
        }
        return { kind, items };
      }
    } catch {
      // cae al parseo de texto
    }
  }
  const items = (formData.get("sizes")?.toString() ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label) => ({ label, hex: null }));
  return { kind, items };
}

function revalidate() {
  revalidatePath("/admin/tallas");
  revalidatePath("/admin/categorias");
}

/** Reemplaza los items (size_preset_items) de un preset. */
async function replacePresetItems(
  supabase: ReturnType<typeof createServiceClient>,
  presetId: string,
  items: PresetItem[],
): Promise<void> {
  await supabase.from("size_preset_items").delete().eq("preset_id", presetId);
  if (items.length === 0) return;
  const rows = items.map((item, i) => ({
    preset_id: presetId,
    label: item.label,
    swatch_hex: item.hex,
    sort_order: i,
  }));
  const { error } = await supabase.from("size_preset_items").insert(rows);
  if (error) throw new Error(error.message);
}

export async function adminCreateSizePreset(
  _prev: SizePresetActionState | undefined,
  formData: FormData,
): Promise<SizePresetActionState> {
  try {
    await requireAdmin();
    const name = formData.get("name")?.toString().trim() ?? "";
    if (!name) throw new Error("El nombre es obligatorio.");
    const { kind, items } = parsePresetInput(formData);
    if (items.length === 0)
      throw new Error(
        kind === "color" ? "Agrega al menos un color." : "Agrega al menos una talla.",
      );

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("size_presets")
      .insert({ name, kind })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await replacePresetItems(supabase, (data as { id: string }).id, items);

    revalidate();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear." };
  }
}

export async function adminUpdateSizePreset(
  _prev: SizePresetActionState | undefined,
  formData: FormData,
): Promise<SizePresetActionState> {
  try {
    await requireAdmin();
    const id = formData.get("preset_id")?.toString().trim() ?? "";
    if (!id) throw new Error("Falta el identificador.");
    const name = formData.get("name")?.toString().trim() ?? "";
    if (!name) throw new Error("El nombre es obligatorio.");
    const { kind, items } = parsePresetInput(formData);
    if (items.length === 0)
      throw new Error(
        kind === "color" ? "Agrega al menos un color." : "Agrega al menos una talla.",
      );

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("size_presets")
      .update({ name, kind })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await replacePresetItems(supabase, id, items);

    revalidate();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }
}

export async function adminDeleteSizePreset(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("size_presets").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidate();
}
