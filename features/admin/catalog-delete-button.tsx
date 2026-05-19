"use client";

import { useState } from "react";
import { adminDeleteProduct } from "@/lib/actions/products-admin";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const iconDanger =
  "inline-flex size-9 items-center justify-center rounded-md border-2 border-destructive/40 text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function CatalogDeleteButton({ productId }: { productId: string }) {
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
      await adminDeleteProduct(productId);
      setOpen(false);
      router.refresh();
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
        className={iconDanger}
        aria-label="Eliminar artículo"
        onClick={handleOpen}
      >
        <Trash2 className="size-4" aria-hidden />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/15">
                <AlertTriangle className="size-5 text-destructive" aria-hidden />
              </div>
              <h2
                id="delete-dialog-title"
                className="text-base font-semibold text-zinc-100"
              >
                ¿Eliminar artículo?
              </h2>
            </div>

            <p className="mb-5 text-sm text-zinc-400">
              Esta acción no se puede deshacer. El artículo será eliminado
              permanentemente del catálogo.
            </p>

            {error && (
              <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                className="inline-flex h-9 items-center justify-center rounded-md border-2 border-zinc-600 px-4 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                className="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
