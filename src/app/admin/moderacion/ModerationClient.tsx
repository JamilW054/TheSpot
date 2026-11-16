"use client";

import { Ban, Check, ExternalLink, Flag, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminBadge, AdminCard, EmptyState } from "@/components/admin/ui";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import type {
  ModerationProduct,
  ModerationReport,
} from "@/database/repositories/moderation";
import {
  adminDismissReport,
  adminModerateProduct,
} from "@/lib/actions/moderation";
import { formatDOPFromCents } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import {
  type ModerationStatus,
  REPORT_REASON_LABEL,
  type ReportReason,
} from "@/lib/stores/status";

function Thumb({ src }: { src: string | null }) {
  return (
    <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
      {src ? (
        // biome-ignore lint/performance/noImgElement: imagen de producto (URL externa)
        <img src={src} alt="" className="size-full object-cover" />
      ) : null}
    </div>
  );
}

function ProductActions({
  productId,
  status,
}: {
  productId: string;
  status: string;
}) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const run = (next: ModerationStatus, msg: string) => {
    setBusy(next);
    start(async () => {
      const res = await adminModerateProduct(productId, next, note);
      setBusy(null);
      if (!res.ok) {
        showError(res.error);
        return;
      }
      showSuccess(msg);
      router.refresh();
    });
  };
  const spin = (k: string, Icon: typeof Check) =>
    busy === k && pending ? (
      <Loader2 className="size-4 animate-spin" aria-hidden />
    ) : (
      <Icon className="size-4" aria-hidden />
    );

  return (
    <div className="flex flex-col gap-2 sm:w-64">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Motivo (para rechazar o bloquear)"
        aria-label="Motivo"
        className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm"
      />
      <div className="flex gap-2">
        {status !== "approved" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("approved", "Producto publicado.")}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {spin("approved", Check)} Aprobar
          </button>
        ) : null}
        {status !== "rejected" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("rejected", "Producto rechazado.")}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {spin("rejected", X)} Rechazar
          </button>
        ) : null}
        {status !== "blocked" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("blocked", "Producto bloqueado.")}
            title="Bloquear: la tienda no puede volver a publicarlo"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-red-300 px-2.5 text-red-700 hover:bg-red-50 disabled:opacity-50"
            aria-label="Bloquear"
          >
            {spin("blocked", Ban)}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function DismissButton({ reportId }: { reportId: string }) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await adminDismissReport(reportId);
          if (!res.ok) {
            showError(res.error);
            return;
          }
          showSuccess("Denuncia descartada.");
          router.refresh();
        })
      }
      className="h-9 rounded-lg border border-border px-3 text-sm hover:bg-muted disabled:opacity-50"
    >
      Descartar denuncia
    </button>
  );
}

export function ModerationClient({
  tab,
  products,
  reports,
}: {
  tab: string;
  products: ModerationProduct[];
  reports: ModerationReport[];
}) {
  if (tab === "denuncias") {
    if (reports.length === 0) {
      return (
        <EmptyState
          icon={<Flag className="size-6" />}
          title="No hay denuncias abiertas"
        />
      );
    }
    return (
      <div className="space-y-3">
        {reports.map((r) => (
          <AdminCard
            key={r.id}
            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start"
          >
            <Thumb src={r.coverImage} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/catalogo/${r.productSlug}`}
                  target="_blank"
                  className="font-semibold hover:underline"
                >
                  {r.productName}
                </Link>
                <AdminBadge tone="danger">
                  {REPORT_REASON_LABEL[r.reason as ReportReason] ?? r.reason}
                </AdminBadge>
              </div>
              <p className="text-sm text-muted-foreground">
                {r.storeName} · {formatDate(r.createdAt)}
                {r.reporterEmail ? ` · ${r.reporterEmail}` : ""}
              </p>
              {r.details ? <p className="mt-1 text-sm">{r.details}</p> : null}
            </div>
            <div className="flex flex-col gap-2">
              <ProductActions
                productId={r.productId}
                status={r.productStatus}
              />
              <DismissButton reportId={r.id} />
            </div>
          </AdminCard>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={tab === "pending" ? "Nada por revisar" : "No hay productos aquí"}
        description={
          tab === "pending"
            ? "Los productos nuevos de tiendas no confiables aparecerán aquí."
            : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {products.map((p) => (
        <AdminCard
          key={p.id}
          className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start"
        >
          <Thumb src={p.coverImage} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{p.name}</span>
              <span className="font-mono text-sm text-muted-foreground">
                {formatDOPFromCents(p.priceCents)}
              </span>
              {p.openReports > 0 ? (
                <AdminBadge tone="danger">
                  {p.openReports} denuncia(s)
                </AdminBadge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              <Link
                href={`/admin/tiendas/${p.storeId}`}
                className="hover:underline"
              >
                {p.storeName}
              </Link>{" "}
              · {formatDate(p.createdAt)}
            </p>
            {p.note ? (
              <p className="mt-1 text-xs font-medium text-amber-700">
                {p.note}
              </p>
            ) : null}
            {p.description ? (
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                {p.description}
              </p>
            ) : null}
            <Link
              href={`/admin/catalogo/${p.slug}/editar`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver ficha completa <ExternalLink className="size-3" aria-hidden />
            </Link>
          </div>
          <ProductActions productId={p.id} status={p.status} />
        </AdminCard>
      ))}
    </div>
  );
}
