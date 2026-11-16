"use client";

import { Check, Loader2, PauseCircle, PlayCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import { adminSetStoreFlags, adminSetStoreStatus } from "@/lib/actions/stores";
import type { StoreStatus } from "@/lib/stores/status";

export function StoreReviewActions({
  storeId,
  status,
  isOfficial,
  trusted,
  isFeatured,
}: {
  storeId: string;
  status: StoreStatus;
  isOfficial: boolean;
  trusted: boolean;
  isFeatured: boolean;
}) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const run = (
    key: string,
    fn: () => Promise<{ ok: true } | { ok: false; error: string }>,
    msg: string,
  ) => {
    setBusy(key);
    start(async () => {
      const res = await fn();
      setBusy(null);
      if (!res.ok) {
        showError(res.error);
        return;
      }
      showSuccess(msg);
      setReason("");
      router.refresh();
    });
  };

  const btn =
    "inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-50";
  const icon = (key: string, Icon: typeof Check) =>
    busy === key && pending ? (
      <Loader2 className="size-4 animate-spin" aria-hidden />
    ) : (
      <Icon className="size-4" aria-hidden />
    );

  return (
    <div className="space-y-4">
      {!isOfficial ? (
        <>
          <div>
            <label
              htmlFor="reason"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              Motivo (obligatorio para rechazar o suspender; la tienda lo verá)
            </label>
            <textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Ej. Falta el RNC / vende productos no permitidos…"
            />
          </div>
          <div className="grid gap-2">
            {status !== "approved" ? (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  run(
                    "approve",
                    () => adminSetStoreStatus(storeId, "approved", reason),
                    "Tienda aprobada.",
                  )
                }
                className={`${btn} bg-emerald-600 text-white hover:bg-emerald-700`}
              >
                {icon("approve", status === "suspended" ? PlayCircle : Check)}
                {status === "suspended" ? "Reactivar tienda" : "Aprobar tienda"}
              </button>
            ) : null}
            {status === "pending" ? (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  run(
                    "reject",
                    () => adminSetStoreStatus(storeId, "rejected", reason),
                    "Solicitud rechazada.",
                  )
                }
                className={`${btn} border border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10`}
              >
                {icon("reject", X)} Rechazar
              </button>
            ) : null}
            {status === "approved" ? (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  run(
                    "suspend",
                    () => adminSetStoreStatus(storeId, "suspended", reason),
                    "Tienda suspendida.",
                  )
                }
                className={`${btn} border border-border hover:bg-muted`}
              >
                {icon("suspend", PauseCircle)} Suspender
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          La tienda oficial siempre está aprobada.
        </p>
      )}

      <div className="space-y-3 border-t border-border pt-4">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-primary"
            checked={trusted}
            disabled={pending}
            onChange={(e) => {
              const next = e.target.checked;
              run(
                "trusted",
                () => adminSetStoreFlags(storeId, { trusted: next }),
                "Guardado.",
              );
            }}
          />
          <span>
            <span className="font-medium">Confiable</span>
            <span className="block text-xs text-muted-foreground">
              Sus productos se publican sin revisión (salvo si contienen
              palabras prohibidas).
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-primary"
            checked={isFeatured}
            disabled={pending}
            onChange={(e) => {
              const next = e.target.checked;
              run(
                "featured",
                () => adminSetStoreFlags(storeId, { isFeatured: next }),
                "Guardado.",
              );
            }}
          />
          <span>
            <span className="font-medium">Destacada</span>
            <span className="block text-xs text-muted-foreground">
              Aparece en «Tiendas destacadas» de la portada.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}
