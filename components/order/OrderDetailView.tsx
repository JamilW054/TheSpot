"use client";

import Link from "next/link";
import Image from "next/image";
import type { OrderStatusDetail } from "@/types";

function isExternalImage(src: string): boolean {
  if (!src) return false;
  return (
    src.includes("placehold.co") ||
    src.includes("imgur.com") ||
    src.includes("unsplash.com") ||
    src.startsWith("http")
  );
}

const STATUS_LABELS: Record<OrderStatusDetail["status"], string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completado: "Completado",
};

const STATUS_DESCRIPTIONS: Record<OrderStatusDetail["status"], string> = {
  pendiente: "Tu pedido está registrado y pendiente de pago o preparación.",
  en_proceso: "Estamos preparando tu pedido.",
  completado: "Tu pedido ha sido enviado o entregado.",
};

export interface OrderDetailViewProps {
  order: OrderStatusDetail;
  backHref: string;
  backLabel: string;
}

export function OrderDetailView({ order, backHref, backLabel }: OrderDetailViewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/30 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nº de pedido
            </p>
            <p className="mt-1 font-mono text-sm text-foreground">{order.id}</p>
          </div>
          <div className="rounded-lg border border-border bg-background px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Estado
            </p>
            <p className="mt-0.5 font-semibold text-foreground">{STATUS_LABELS[order.status]}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {STATUS_DESCRIPTIONS[order.status]}
        </p>
        {order.shippingName && (
          <p className="mt-2 text-sm text-muted-foreground">
            Envío a: <span className="text-foreground">{order.shippingName}</span>
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">Fecha: {order.createdAt}</p>
      </div>

      <ul className="divide-y divide-border">
        {order.items.map((item, i) => (
          <li key={i} className="flex gap-4 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex shrink-0 gap-2">
              <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28">
                {item.coverImageUrl ? (
                  <Image
                    src={item.coverImageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="112px"
                    unoptimized={isExternalImage(item.coverImageUrl)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <svg className="size-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                )}
              </div>
              {item.designCoverImageUrl && (
                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-20">
                  <Image
                    src={item.designCoverImageUrl}
                    alt={item.designName ?? "Diseño"}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={isExternalImage(item.designCoverImageUrl)}
                  />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">
                {item.productSlug ? (
                  <Link href={`/catalogo/${item.productSlug}`} className="hover:text-primary transition-colors">
                    {item.productName}
                  </Link>
                ) : (
                  item.productName
                )}
              </p>
              {item.designName && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Con diseño: <span className="text-foreground">{item.designName}</span>
                </p>
              )}
              <p className="mt-1.5 text-sm text-muted-foreground tabular-nums">
                {(item.unitPriceCents / 100).toFixed(2).replace(".", ",")} € × {item.quantity}
              </p>
            </div>
            <p className="font-semibold tabular-nums text-foreground shrink-0 self-center">
              {((item.unitPriceCents * item.quantity) / 100).toFixed(2).replace(".", ",")} €
            </p>
          </li>
        ))}
      </ul>

      <div className="border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm font-medium text-muted-foreground">Total</span>
          <span className="text-xl font-bold tabular-nums text-primary">
            {(order.totalCents / 100).toFixed(2).replace(".", ",")} €
          </span>
        </div>
      </div>

      <p className="border-t border-border p-4 text-center text-sm text-muted-foreground">
        <Link href={backHref} className="font-medium text-foreground hover:text-primary transition-colors">
          {backLabel}
        </Link>
      </p>
    </div>
  );
}
