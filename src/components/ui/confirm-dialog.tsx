"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";

export interface ConfirmDialogState {
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
}

/**
 * Modal de confirmación reutilizable — reemplazo de `window.confirm`. El
 * llamador controla el estado (`ConfirmDialogState | null`) y renderiza este
 * componente solo cuando hay un estado activo.
 */
export function ConfirmDialog({
  state,
  onCancel,
}: {
  state: ConfirmDialogState;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  const isDanger = state.variant === "danger";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCancel}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start gap-3 p-5">
          {isDanger && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle
                className="size-4.5 text-destructive"
                aria-hidden
              />
            </div>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-semibold text-foreground">
              {state.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {state.description}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={state.onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 ${
              isDanger
                ? "bg-destructive text-white"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {state.confirmLabel ?? "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
