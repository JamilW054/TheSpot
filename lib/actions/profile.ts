"use server";

import { revalidatePath } from "next/cache";
import {
  updateProfile as dbUpdateProfile,
  type ProfileInput,
} from "@/lib/db/profiles";

export type ProfileActionState = { ok?: true; error?: string };

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
