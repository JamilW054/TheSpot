import { Clock, ShieldX, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { getStoreById, getStoreHistory } from "@/database/repositories/stores";
import { getStoreActor } from "@/lib/auth/store-actor";
import { formatDate } from "@/lib/format-date";
import { isStoreStatus, STORE_STATUS_LABEL } from "@/lib/stores/status";
import { ResubmitClient } from "./ResubmitClient";

export default async function SolicitudPage() {
  const actor = await getStoreActor();
  if (!actor?.store) redirect("/vender/registro");
  if (actor.store.status === "approved") redirect("/panel");
  const store = await getStoreById(actor.store.id);
  if (!store) redirect("/vender/registro");
  const history = await getStoreHistory(store.id);

  const banner =
    store.status === "pending"
      ? {
          icon: Clock,
          tone: "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200",
          title: "Tu solicitud está en revisión",
          text: "Te avisaremos por correo cuando tu tienda sea aprobada. Suele tomar menos de 48 horas. Puedes corregir tus datos mientras tanto.",
        }
      : store.status === "rejected"
        ? {
            icon: XCircle,
            tone: "border-red-300 bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-200",
            title: "Tu solicitud necesita cambios",
            text: "Corrige lo indicado y vuelve a enviarla.",
          }
        : {
            icon: ShieldX,
            tone: "border-zinc-300 bg-zinc-50 text-zinc-900 dark:bg-zinc-500/10 dark:text-zinc-200",
            title: "Tu tienda está suspendida",
            text: "Tus productos no se muestran en The Spot. Escríbenos si crees que es un error.",
          };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className={`flex gap-3 rounded-2xl border p-5 ${banner.tone}`}>
        <banner.icon className="mt-0.5 size-6 shrink-0" aria-hidden />
        <div>
          <h1 className="text-lg font-semibold">{banner.title}</h1>
          <p className="mt-1 text-sm opacity-90">{banner.text}</p>
          {store.statusReason ? (
            <p className="mt-3 rounded-lg bg-white/60 px-3 py-2 text-sm dark:bg-black/20">
              <strong>Motivo:</strong> {store.statusReason}
            </p>
          ) : null}
        </div>
      </div>

      {store.status !== "suspended" ? (
        <ResubmitClient
          status={store.status}
          initial={{
            name: store.name,
            tagline: store.tagline,
            description: store.description,
            businessType: store.businessType,
            legalName: store.legalName,
            taxId: store.taxId,
            contactName: store.contactName ?? "",
            phone: store.phone ?? "",
            whatsapp: store.whatsapp,
            email: store.email ?? "",
            notificationEmail: store.notificationEmail,
            province: store.province ?? "",
            city: store.city,
            address: store.address,
            instagram: store.instagram,
            facebook: store.facebook,
            website: store.website,
            sellsCategories: store.sellsCategories,
            applicationNote: store.applicationNote,
          }}
        />
      ) : null}

      {history.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Historial</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex flex-wrap gap-x-2 text-muted-foreground"
              >
                <span className="font-medium text-foreground">
                  {isStoreStatus(h.status)
                    ? STORE_STATUS_LABEL[h.status]
                    : h.status}
                </span>
                <span>· {formatDate(h.createdAt)}</span>
                {h.reason ? <span>· {h.reason}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
