"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_PAYMENTS_API_URL ?? "";

export default function PagoAzulPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPagar = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!API_BASE) {
        throw new Error(
          "Configura NEXT_PUBLIC_PAYMENTS_API_URL para usar la demo del API externo, o paga desde el checkout normal.",
        );
      }
      const checkoutRes = await fetch(`${API_BASE}/api/pagos/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user-1",
          amount: 1500.0,
          currency: "DOP",
          returnUrl: `${API_BASE}/api/pagos/azul/retorno`,
        }),
      });
      if (!checkoutRes.ok) {
        const text = await checkoutRes.text();
        throw new Error(`Checkout falló: ${text}`);
      }
      const data = (await checkoutRes.json()) as { paymentUrl: string };
      window.location.href = `${API_BASE}${data.paymentUrl}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-3xl font-bold text-foreground">
        Pago con AZUL (demo)
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Vista opcional para probar un API de pagos externo. El flujo recomendado
        es finalizar compra en{" "}
        <a
          href="/carrito/checkout"
          className="font-medium text-primary underline"
        >
          Checkout
        </a>
        .
      </p>
      {error && (
        <p className="mt-4 rounded-lg border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={onPagar}
        disabled={loading || !API_BASE}
        className="mt-8 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-60"
      >
        {loading ? "Procesando..." : "Pagar (API externo)"}
      </button>
    </main>
  );
}
