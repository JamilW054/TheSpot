"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceClient } from "@/lib/supabase/server";

export type SizePresetActionState = { ok?: true; error?: string };

function revalidate() {
  revalidatePath("/admin/tallas");
  revalidatePath("/admin/categorias");
}

export async function adminCreateSizePreset(
  _prev: SizePresetActionState | undefined,
  formData: FormData,
): Promise<SizePresetActionState> {
  try {
    await requireAdmin();
    const name = formData.get("name")?.toString().trim() ?? "";
    if (!name) throw new Error("El nombre es obligatorio.");
    const supabase = createServiceClient();
    const { error } = await supabase.from("size_presets").insert({ name });
    if (error) throw new Error(error.message);
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
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("size_presets")
      .update({ name })
      .eq("id", id);
    if (error) throw new Error(error.message);
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
