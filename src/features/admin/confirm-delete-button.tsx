"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const defaultTriggerCls =
  "inline-flex size-9 items-center justify-center rounded-md border-2 border-destructive/40 text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export interface ConfirmDeleteButtonProps {
  onConfirm: () => Promise<void>;
  /** Texto que describe la consecuencia de eliminar. Personalizable por contexto. */
  description: string;
  title?: string;
  triggerClassName?: string;
  triggerLabel?: string;
  /** Si se pasa, reemplaza el router.refresh() por defecto tras eliminar con éxito. */
  onSuccess?: () => void;
}

export function ConfirmDeleteButton({
  onConfirm,
  description,
  title = "¿Eliminar?",
  triggerClassName = defaultTriggerCls,
  triggerLabel = "Eliminar",
  onSuccess,
}: ConfirmDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    setError(null);
    setOpen(true);
  }

  function handleClose() {
    if (!pending) setOpen(false);
  }

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        aria-label={triggerLabel}
        onClick={handleOpen}
      >
        <Trash2 className="size-4" aria-hidden />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/15">
                <AlertTriangle
                  className="size-5 text-destructive"
                  aria-hidden
                />
              </div>
              <h2
                id="confirm-delete-title"
                className="text-base font-semibold text-foreground"
              >
                {title}
              </h2>
            </div>

            <p className="mb-5 text-sm text-muted-foreground">{description}</p>

            {error && (
              <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                className="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                onClick={handleConfirm}
              >
                {pending ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
