"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  ConfirmDialog,
  type ConfirmDialogState,
} from "@/components/ui/confirm-dialog";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import { adminDeleteOrder } from "@/lib/actions/orders-admin";

export function DeleteFacturaButton({
  id,
  cliente,
}: {
  id: string;
  cliente: string;
}) {
  const { showError } = useAdminFeedback();
  const [loading, setLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmDialogState | null>(
    null,
  );

  function handleDelete() {
    setConfirmState({
      title: "¿Eliminar factura?",
      description: `Se eliminará la factura de "${cliente}". Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        setConfirmState(null);
        setLoading(true);
        try {
          await adminDeleteOrder(id);
        } catch (err) {
          showError(err instanceof Error ? err.message : "Error al eliminar");
          setLoading(false);
        }
      },
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        title="Eliminar factura"
        className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors disabled:opacity-40"
      >
        <Trash2 className="size-3.5" />
      </button>
      {confirmState && (
        <ConfirmDialog
          state={confirmState}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </>
  );
}
