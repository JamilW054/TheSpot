"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { adminDeleteOrder } from "@/lib/actions/orders-admin";

export function DeleteFacturaButton({ id, cliente }: { id: string; cliente: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`¿Eliminar factura de "${cliente}"? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    try {
      await adminDeleteOrder(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      title="Eliminar factura"
      className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors disabled:opacity-40"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
