export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { AdminViewportScrollbar } from "@/components/admin/AdminViewportScrollbar";
import { RequireAuth } from "@/components/auth";
import { AppShell } from "@/components/layout";
import { AdminFeedbackProvider } from "@/contexts/admin-feedback-context";
import { getStoreActor } from "@/lib/auth/store-actor";

/**
 * Panel de cada tienda. El dueño solo ve y gestiona lo suyo; el admin de la
 * plataforma entra aquí para operar la tienda oficial (de la que es dueño).
 * Mientras la tienda no esté aprobada, el menú solo muestra la solicitud.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getStoreActor();
  if (!actor) redirect("/login?next=/panel");
  if (!actor.store) redirect(actor.isAdmin ? "/admin" : "/vender/registro");
  const approved = actor.store.status === "approved";

  return (
    <RequireAuth requireSeller>
      <AdminViewportScrollbar />
      <div className="admin-scope min-h-full">
        <AdminFeedbackProvider>
          <AppShell
            variant="seller"
            storeName={actor.store.name}
            showAdminLink={actor.isAdmin}
            navOverride={
              approved
                ? undefined
                : [
                    {
                      label: "Mi solicitud",
                      href: "/panel/solicitud",
                      icon: "Store",
                      adminSection: "Tienda",
                    },
                  ]
            }
          >
            {children}
          </AppShell>
        </AdminFeedbackProvider>
      </div>
    </RequireAuth>
  );
}
