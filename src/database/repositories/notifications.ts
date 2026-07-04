import { createClient } from "@/lib/supabase/server";

/**
 * Feed de notificaciones del usuario: difusión (`broadcast`, sin `user_id`) más
 * las dirigidas a él (`user_id = uid`). El estado de lectura se deriva de la
 * tabla `notification_reads` (PK compuesta notification_id + user_id).
 */

export interface UserNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  linkPath: string | null;
  createdAt: string;
  isRead: boolean;
}

interface NotifRow {
  id: string;
  type: string;
  title: string;
  body: string;
  link_path: string | null;
  created_at: string;
}

const NOTIF_SELECT = "id, type, title, body, link_path, created_at";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function getUserNotifications(
  limit = 50,
): Promise<UserNotification[]> {
  const { supabase, user } = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIF_SELECT)
    .or(`user_id.eq.${user.id},user_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];

  const rows = (data ?? []) as unknown as NotifRow[];
  const ids = rows.map((r) => r.id);
  const readSet = new Set<string>();
  if (ids.length > 0) {
    const { data: reads } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", user.id)
      .in("notification_id", ids);
    for (const r of reads ?? []) {
      readSet.add((r as { notification_id: string }).notification_id);
    }
  }

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    linkPath: r.link_path,
    createdAt: r.created_at,
    isRead: readSet.has(r.id),
  }));
}

/** Número de notificaciones no leídas del usuario. */
export async function getUnreadNotificationCount(): Promise<number> {
  const notifications = await getUserNotifications(100);
  return notifications.filter((n) => !n.isRead).length;
}

/** Marca una notificación como leída (idempotente). */
export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Debes iniciar sesión.");
  const { error } = await supabase.from("notification_reads").upsert(
    {
      notification_id: notificationId,
      user_id: user.id,
      read_at: new Date().toISOString(),
    },
    { onConflict: "notification_id,user_id", ignoreDuplicates: true },
  );
  if (error) throw new Error(error.message);
}

/** Marca como leídas todas las notificaciones visibles del usuario. */
export async function markAllNotificationsRead(): Promise<void> {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("Debes iniciar sesión.");

  const { data } = await supabase
    .from("notifications")
    .select("id")
    .or(`user_id.eq.${user.id},user_id.is.null`);
  const ids = (data ?? []).map((r) => (r as { id: string }).id);
  if (ids.length === 0) return;

  const now = new Date().toISOString();
  const { error } = await supabase.from("notification_reads").upsert(
    ids.map((id) => ({
      notification_id: id,
      user_id: user.id,
      read_at: now,
    })),
    { onConflict: "notification_id,user_id", ignoreDuplicates: true },
  );
  if (error) throw new Error(error.message);
}
