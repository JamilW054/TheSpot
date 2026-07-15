"use server";

import { revalidatePath } from "next/cache";
import {
  updateProfile as dbUpdateProfile,
  type ProfileInput,
} from "@/database/repositories/profiles";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type ProfileActionState = { ok?: true; error?: string };

/**
 * Guarda el correo del usuario en `profiles.email` justo después del registro.
 * El perfil ya existe (lo crea el trigger `handle_new_user` al insertar en
 * auth.users), así que esto solo actualiza la columna. Usa la service role
 * porque `email` no está en el GRANT de columnas editables por el cliente.
 * No bloquea el registro: cualquier fallo se ignora en silencio.
 */
export async function syncProfileEmail(
  userId: string,
  email: string,
): Promise<void> {
  const id = userId?.trim();
  const mail = email?.trim().toLowerCase();
  if (!id || !mail) return;
  try {
    const sessionClient = await createClient();
    const { data } = await sessionClient.auth.getUser();
    if (
      !data.user ||
      data.user.id !== id ||
      data.user.email?.toLowerCase() !== mail
    )
      return;
    const supabase = createServiceClient();
    await supabase.from("profiles").update({ email: mail }).eq("id", id);
  } catch {
    // best-effort: si falla, el correo igual está en auth.users
  }
}

export async function updateProfileAction(
  input: ProfileInput,
): Promise<ProfileActionState> {
  try {
    await dbUpdateProfile(input);
    revalidatePath("/cuenta");
    revalidatePath("/cuenta/perfil");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado." };
  }
}
