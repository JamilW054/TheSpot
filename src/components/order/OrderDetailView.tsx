"use client";

import Link from "next/link";
import Image from "next/image";
import type { OrderStatusDetail } from "@/types";
import { formatDOPFromCents } from "@/lib/format-currency";

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

const STATUS_BADGE_CLASS: Record<OrderStatusDetail["status"], string> = {
  pendiente: "bg-muted text-muted-foreground border-border",
  en_proceso: "bg-primary/10 text-primary border-primary/20",
  completado:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export interface OrderDetailViewProps {
  order: OrderStatusDetail;
  backHref: string;
  backLabel: string;
}

export function OrderDetailView({
  order,
  backHref,
  backLabel,
}: OrderDetailViewProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        <Link
          href={backHref}
          className="font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </Link>
      </p>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/20 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nº de pedido
              </p>
              <p className="mt-1 font-mono text-sm text-foreground break-all">
                {order.id}
              </p>
            </div>
            <div
              className={`rounded-xl border px-4 py-2 shrink-0 ${STATUS_BADGE_CLASS[order.status]}`}
            >
              <p className="text-xs font-medium uppercase tracking-wider opacity-90">
                Estado
              </p>
              <p className="mt-0.5 font-semibold">
                {STATUS_LABELS[order.status]}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {STATUS_DESCRIPTIONS[order.status]}
          </p>
          {order.shippingName && (
            <p className="mt-2 text-sm text-muted-foreground">
              Envío a:{" "}
              <span className="text-foreground">{order.shippingName}</span>
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            Fecha: {order.createdAt}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pago:{" "}
            <span className="text-foreground">
              {order.paymentStatus === "paid" ? "Pagado" : "Pendiente de pago"}
            </span>
          </p>
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
                      <svg
                        className="size-10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  {item.productSlug ? (
                    <Link
                      href={`/catalogo/${item.productSlug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {item.productName}
                    </Link>
                  ) : (
                    item.productName
                  )}
                </p>
                {(item.size || item.color) && (
                  <p className="mt-1 flex flex-wrap gap-1.5">
                    {item.size && (
                      <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Talla: {item.size}
                      </span>
                    )}
                    {item.color && (
                      <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Color: {item.color}
                      </span>
                    )}
                  </p>
                )}
                <p className="mt-1.5 font-mono text-sm text-muted-foreground tabular-nums">
                  {formatDOPFromCents(item.unitPriceCents)} × {item.quantity}
                </p>
              </div>
              <p className="font-mono text-sm font-semibold tabular-nums text-foreground shrink-0 self-center">
                {formatDOPFromCents(item.unitPriceCents * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm font-medium text-muted-foreground">
              Total
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-primary">
              {formatDOPFromCents(order.totalCents)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
