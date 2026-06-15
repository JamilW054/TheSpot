"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/server";

export type SizePresetActionState = { ok?: true; error?: string };

function parseSizes(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function revalidate() {
  revalidatePath("/admin/tallas");
  revalidatePath("/admin/categorias");
}

/** Reemplaza las tallas (size_preset_items) de un preset. */
async function replacePresetItems(
  supabase: ReturnType<typeof createServiceClient>,
  presetId: string,
  sizes: string[],
): Promise<void> {
  await supabase.from("size_preset_items").delete().eq("preset_id", presetId);
  if (sizes.length === 0) return;
  const rows = sizes.map((label, i) => ({
    preset_id: presetId,
    label,
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
    const sizes = parseSizes(formData.get("sizes")?.toString() ?? "");
    if (sizes.length === 0) throw new Error("Agrega al menos una talla.");

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("size_presets")
      .insert({ name })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await replacePresetItems(supabase, (data as { id: string }).id, sizes);

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
    const sizes = parseSizes(formData.get("sizes")?.toString() ?? "");
    if (sizes.length === 0) throw new Error("Agrega al menos una talla.");

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("size_presets")
      .update({ name })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await replacePresetItems(supabase, id, sizes);

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
