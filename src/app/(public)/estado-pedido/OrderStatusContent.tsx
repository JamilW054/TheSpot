"use client";

import { getOrderStatusAction } from "@/app/(public)/estado-pedido/actions";
import { OrderDetailView } from "@/components/order/OrderDetailView";
import { useCallback, useEffect, useState } from "react";
import type { OrderStatusDetail } from "@/types";

export function OrderStatusContent({
  initialOrderId = "",
}: {
  /** Número de pedido precargado (p. ej. desde `?pedido=` tras el checkout). */
  initialOrderId?: string;
}) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderStatusDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (value: string) => {
    setError(null);
    setResult(null);
    setLoading(true);
    const res = await getOrderStatusAction(value);
    setLoading(false);
    if (res.ok) {
      setResult(res.order);
    } else {
      setError(res.error);
    }
  }, []);

  useEffect(() => {
    if (initialOrderId) void lookup(initialOrderId);
  }, [initialOrderId, lookup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await lookup(orderId);
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Consultar por número de pedido
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <label
              htmlFor="order-id"
              className="block text-sm font-medium text-foreground"
            >
              Número de pedido
            </label>
            <input
              id="order-id"
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Ej: A09B3EF2"
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-mono text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? "Buscando…" : "Consultar"}
          </button>
        </form>
        {error && (
          <p className="mt-4 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      {result && (
        <OrderDetailView
          order={result}
          backHref="/catalogo"
          backLabel="Volver al catálogo"
        />
      )}
    </div>
  );
}
