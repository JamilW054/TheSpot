"use server";

import { revalidatePath } from "next/cache";
import {
  markAllNotificationsRead as dbMarkAll,
  markNotificationRead as dbMarkRead,
} from "@/database/repositories/notifications";

export type NotificationActionState = { ok?: true; error?: string };

function fail(e: unknown): NotificationActionState {
  return { error: e instanceof Error ? e.message : "Error inesperado." };
}

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationActionState> {
  try {
    await dbMarkRead(notificationId);
    revalidatePath("/cuenta/notificaciones");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionState> {
  try {
    await dbMarkAll();
    revalidatePath("/cuenta/notificaciones");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
