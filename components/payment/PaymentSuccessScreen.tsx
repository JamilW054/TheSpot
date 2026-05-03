"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/contexts/cart-context";
import type { PaymentResult } from "@/types";

export function PaymentSuccessScreen({
  paymentResult,
}: {
  paymentResult: PaymentResult;
}) {
  const { clearCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clearCart();
  }, [clearCart]);

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-primary/25 bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <svg
            className="size-9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-label="Pago completado"
          >
            <title>Pago completado</title>
            <path
              d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="22 4 12 14.01 9 11.01"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
          Pago AZUL
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          ¡Pago exitoso!
        </h1>
        <p className="mt-1 text-sm font-medium text-foreground">
          {paymentResult.merchantName}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {paymentResult.merchantSubtitle}
        </p>

        <dl className="mt-8 space-y-3 rounded-xl bg-muted/40 px-4 py-5 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Total pagado</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {paymentResult.totalPaidLabel}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Estado</dt>
            <dd className="font-medium text-foreground">
              {paymentResult.statusLabel}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Método</dt>
            <dd className="text-foreground">
              {paymentResult.paymentMethodLabel}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Transacción</dt>
            <dd className="font-mono text-xs text-foreground break-all">
              {paymentResult.transactionId}
            </dd>
          </div>
          {paymentResult.authorizationCode ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Autorización</dt>
              <dd className="font-mono text-foreground">
                {paymentResult.authorizationCode}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Procesado</dt>
            <dd className="text-foreground">{paymentResult.processedAt}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Pedido</dt>
            <dd className="font-mono text-xs text-foreground break-all">
              {paymentResult.orderId}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/catalogo"
            className="inline-flex justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Seguir comprando
          </Link>
          <Link
            href="/mis-pedidos"
            className="inline-flex justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground"
          >
            Mis pedidos
          </Link>
        </div>
      </div>
    </main>
  );
}
