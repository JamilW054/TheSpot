import { PageLayout } from "@/components/layout";
import { NotificacionesManager } from "@/features/admin/notificaciones-manager";
import { notificationsRepo } from "@/database/repositories/repositories";
import { createServiceClient } from "@/lib/supabase/server";

async function getUsers() {
  const supabase = createServiceClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .eq("role", 1)
    .order("full_name", { ascending: true });

  return (profiles ?? []).map(
    (p: { id: string; username: string | null; full_name: string | null }) => ({
      id: p.id,
      display: p.full_name ?? p.username ?? p.id,
    }),
  );
}

export default async function AdminNotificacionesPage() {
  const [rows, users] = await Promise.all([
    notificationsRepo.findMany(),
    getUsers(),
  ]);
  return (
    <PageLayout
      title="Notificaciones"
      description="Avisos enviados dentro de la aplicación."
    >
      <NotificacionesManager initialRows={rows} users={users} />
    </PageLayout>
  );
}
