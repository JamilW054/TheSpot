"use client";

import {
  ExternalLink,
  FileText,
  Hash,
  Mail,
  Package,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { PaymentTimeline } from "@/components/payment/PaymentTimeline";
import { PaymentTypeBadge } from "@/components/payment/PaymentTypeBadge";
import type {
  CustomerPaymentRequest,
  PaymentLineItem,
} from "@/lib/db/payments";
import { formatDOPFromCents } from "@/lib/format-currency";
import { formatDateTime } from "@/lib/format-date";
import { isTerminalStatus, paymentStatusMeta } from "@/lib/payments/status";

function isExternalImage(src: string): boolean {
  return (
    src.includes("placehold.co") ||
    src.includes("imgur.com") ||
    src.includes("unsplash.com") ||
    src.startsWith("http")
  );
}

type FilterKey = "all" | "active" | "paid";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Activas" },
  { key: "paid", label: "Pagadas" },
];

export function PagosContent({
  requests,
}: {
  requests: CustomerPaymentRequest[];
}) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const visible = requests.filter((r) => {
    if (filter === "paid") return r.status === "paid";
    if (filter === "active")
      return !isTerminalStatus(r.status) || r.status === "in_process";
    return true;
  });

  if (requests.length === 0) {
    return (
      <div className="animate-scale-in rounded-[14px] border border-border bg-card p-12 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
          <Wallet className="size-8 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Sin solicitudes de pago
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
          Cuando recibas una solicitud de pago aparecerá aquí con todos sus
          detalles y su estado en tiempo real.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-[14px] border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No hay solicitudes en esta vista.
        </p>
      ) : (
        <ul className="space-y-4">
          {visible.map((r) => (
            <li key={r.id}>
              <PaymentCard request={r} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PaymentCard({ request: r }: { request: CustomerPaymentRequest }) {
  const meta = paymentStatusMeta(r.status);
  const canPay = Boolean(r.paymentUrl) && !isTerminalStatus(r.status);

  return (
    <article className="overflow-hidden rounded-[16px] border border-border bg-card">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <Hash className="size-3" aria-hidden />
            <span className="font-mono">{r.referenceNumber}</span>
          </div>
          <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
            {formatDOPFromCents(r.amountCents)}
          </p>
          {r.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {r.description}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <PaymentStatusBadge status={r.status} />
          <PaymentTypeBadge type={r.paymentType} />
        </div>
      </div>

      {/* Vista previa de productos */}
      {r.items.length > 0 && <ProductPreview items={r.items} />}

      {/* Detalles */}
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        <Detail icon={Wallet} label="Método de pago" value={r.methodName} />
        <Detail
          icon={FileText}
          label="Fecha de emisión"
          value={formatDateTime(r.createdAt)}
        />
        {r.sentAt && (
          <Detail
            icon={Mail}
            label="Enlace enviado"
            value={formatDateTime(r.sentAt)}
          />
        )}
      </div>

      {/* Estado descripción + CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-4">
        <p className="text-sm text-muted-foreground">{meta.description}</p>
        {canPay && r.paymentUrl && (
          <a
            href={r.paymentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Pagar ahora
            <ExternalLink className="size-4" aria-hidden />
          </a>
        )}
      </div>

      {/* Timeline */}
      <div className="border-t border-border/60 bg-muted/20 px-5 py-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Seguimiento del pago
        </p>
        <PaymentTimeline status={r.status} events={r.history} />
      </div>
    </article>
  );
}

function ProductPreview({ items }: { items: PaymentLineItem[] }) {
  return (
    <div className="border-b border-border/60 px-5 py-4">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Package className="size-3.5" aria-hidden />
        Productos ({items.reduce((n, it) => n + it.quantity, 0)})
      </div>
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li
            key={`${it.name}-${i}`}
            className="flex items-center gap-3 sm:gap-4"
          >
            <div className="relative size-14 shrink-0 overflow-hidden rounded-[10px] bg-muted ring-1 ring-border/50">
              {it.imageUrl ? (
                <Image
                  src={it.imageUrl}
                  alt={it.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized={isExternalImage(it.imageUrl)}
                />
              ) : (
                <span className="flex size-full items-center justify-center text-muted-foreground">
                  <Package className="size-5" aria-hidden />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {it.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                {it.quantity} × {formatDOPFromCents(it.unitPriceCents)}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
              {formatDOPFromCents(it.totalCents)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
          {label}
        </p>
        <p
          className={`text-sm font-medium ${
            accent ? "text-amber-600 dark:text-amber-400" : "text-foreground"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
