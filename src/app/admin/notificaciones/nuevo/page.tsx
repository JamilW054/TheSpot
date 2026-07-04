import { PageLayout } from "@/components/layout";
import { NotificationForm } from "@/features/admin/notification-form";
import { adminCreateNotification } from "@/lib/actions/admin-crud";
import { createServiceClient } from "@/lib/supabase/server";

async function getUsers() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .is("deleted_at", null)
    .order("full_name", { ascending: true, nullsFirst: false });
  return (data ?? []).map((p: Record<string, string | null>) => ({
    id: p.id as string,
    display:
      (p.full_name as string | null) ??
      (p.username as string | null) ??
      (p.id as string),
  }));
}

export default async function AdminNotificacionNuevaPage() {
  const users = await getUsers();
  return (
    <PageLayout
      title="Nueva notificación"
      description="Envía un aviso a todos los usuarios o a uno específico."
    >
      <NotificationForm action={adminCreateNotification} users={users} />
    </PageLayout>
  );
}
