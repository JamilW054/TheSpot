import { getUserNotifications } from "@/lib/db/notifications";
import { NotificacionesContent } from "./NotificacionesContent";

export const metadata = {
  title: "Notificaciones | Buxxep",
  description: "Tus notificaciones de Buxxep.",
};

export const dynamic = "force-dynamic";

export default async function NotificacionesPage() {
  const notifications = await getUserNotifications();

  return (
    <article className="w-full max-w-lg px-4 sm:px-6 pb-20 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Notificaciones
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mantente al tanto de tus pedidos y novedades.
        </p>
      </header>

      <NotificacionesContent initial={notifications} />
    </article>
  );
}
