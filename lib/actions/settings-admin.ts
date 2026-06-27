"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { ORDER_NOTIFICATION_EMAIL_KEY, setSetting } from "@/lib/db/settings";

export type SettingsActionState = { ok?: true; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Guarda el correo que recibe el aviso de cada nuevo pedido. Solo admin.
 */
export async function updateOrderNotificationEmail(
  _prev: SettingsActionState | undefined,
  fd: FormData,
): Promise<SettingsActionState> {
  try {
    await requireAdmin();
    const email = fd.get("order_notification_email")?.toString().trim() ?? "";
    if (!EMAIL_RE.test(email)) {
      throw new Error("Introduce un correo válido.");
    }
    await setSetting(ORDER_NOTIFICATION_EMAIL_KEY, email);
    revalidatePath("/admin/config");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado." };
  }
}
