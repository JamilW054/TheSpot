import { Bell } from "lucide-react";

export const metadata = {
  title: "Notificaciones | Buxxep",
  description: "Tus notificaciones de Buxxep.",
};

export default function NotificacionesPage() {
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

      <div className="animate-scale-in rounded-[14px] border border-border bg-card p-12 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
          <Bell className="size-8 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Sin notificaciones
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
          Cuando tengas novedades sobre tus pedidos o promociones exclusivas
          aparecerán aquí.
        </p>
      </div>
    </article>
  );
}
