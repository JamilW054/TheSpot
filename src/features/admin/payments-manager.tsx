"use client";

import {
  ArrowUpDown,
  CalendarDays,
  ChevronDown,
  ExternalLink,
  Eye,
  IdCard,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Send,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { PaymentTypeBadge } from "@/components/payment/PaymentTypeBadge";
import { Badge } from "@/components/ui/badge";
import {
  ConfirmDialog,
  type ConfirmDialogState,
} from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import {
  adminDeletePaymentRequest,
  adminResendPaymentLink,
  adminUpdatePaymentStatus,
} from "@/lib/actions/payments-admin";
import type { AdminPaymentRequest } from "@/database/repositories/payments";
import { formatDOPFromCents } from "@/lib/format-currency";
import { formatDateTime } from "@/lib/format-date";
import {
  PAYMENT_STATUSES,
  type PaymentStatus,
  paymentStatusMeta,
} from "@/lib/payments/status";

type SortKey = "created_at" | "amount" | "status" | "customer";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  ...PAYMENT_STATUSES.map((s) => ({
    value: s,
    label: paymentStatusMeta(s).label,
  })),
];

const STATUS_OPTIONS = PAYMENT_STATUSES.map((s) => ({
  value: s,
  label: paymentStatusMeta(s).label,
}));

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "created_at", label: "Fecha de creación" },
  { value: "amount", label: "Monto" },
  { value: "status", label: "Estado" },
  { value: "customer", label: "Cliente" },
];

export function PaymentsManager({
  initialRows,
}: {
  initialRows: AdminPaymentRequest[];
}) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sendRow, setSendRow] = useState<AdminPaymentRequest | null>(null);
  const [detailsRow, setDetailsRow] = useState<AdminPaymentRequest | null>(
    null,
  );
  const [confirmState, setConfirmState] = useState<ConfirmDialogState | null>(
    null,
  );
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((r) => {
      const matchesQuery =
        q === "" ||
        r.referenceNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        (r.customerEmail ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      switch (sortKey) {
        case "amount":
          return (a.amountCents - b.amountCents) * dir;
        case "status":
          return a.status.localeCompare(b.status) * dir;
        case "customer":
          return a.customerName.localeCompare(b.customerName) * dir;
        default:
          return a.createdAt.localeCompare(b.createdAt) * dir;
      }
    });
  }, [rows, query, statusFilter, sortKey, sortDir]);

  function handleStatusChange(id: string, status: string) {
    const next = status as PaymentStatus;
    setBusyId(id);
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: next } : r)),
    );
    startTransition(async () => {
      const res = await adminUpdatePaymentStatus(id, next);
      setBusyId(null);
      if (res.error) {
        showError(res.error);
        router.refresh();
      } else {
        showSuccess(`Estado actualizado a "${paymentStatusMeta(next).label}".`);
      }
    });
  }

  function handleSend(id: string, url: string) {
    setBusyId(id);
    startTransition(async () => {
      const res = await adminResendPaymentLink(id, url);
      setBusyId(null);
      if (res.error) {
        showError(res.error);
      } else {
        setRows((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: "link_sent", paymentUrl: url } : r,
          ),
        );
        setSendRow(null);
        showSuccess("Enlace de pago enviado al cliente.");
      }
    });
  }

  function handleDelete(id: string, reference: string) {
    setConfirmState({
      title: "¿Eliminar solicitud?",
      description: `Se eliminará la solicitud ${reference}. Esta acción es permanente.`,
      confirmLabel: "Eliminar",
      variant: "danger",
      onConfirm: () => {
        setConfirmState(null);
        setBusyId(id);
        startTransition(async () => {
          const res = await adminDeletePaymentRequest(id);
          setBusyId(null);
          if (res.error) {
            showError(res.error);
          } else {
            setRows((prev) => prev.filter((r) => r.id !== id));
            showSuccess("Solicitud eliminada.");
          }
        });
      },
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar referencia, cliente o correo…"
            className="pl-9"
          />
        </div>
        <Link
          href="/admin/pagos/nuevo"
          title="Crear una solicitud manual (cliente sin pedido en el checkout)"
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Plus className="size-4" aria-hidden />
          Cobro manual
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-44">
          <SelectMenu
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
        <div className="w-48">
          <SelectMenu
            options={SORT_OPTIONS}
            value={sortKey}
            onChange={(v) => setSortKey(v as SortKey)}
          />
        </div>
        <button
          type="button"
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowUpDown className="size-3.5" aria-hidden />
          {sortDir === "asc" ? "Ascendente" : "Descendente"}
        </button>
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} de {rows.length}
        </span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
            <Wallet className="size-8 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            {rows.length === 0
              ? "Aún no hay solicitudes de pago"
              : "Sin resultados"}
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            {rows.length === 0
              ? "Envía tu primer enlace de pago a un cliente."
              : "Ajusta la búsqueda o los filtros."}
          </p>
        </div>
      ) : (
        <>
          {/* ── Tabla (desktop) ── */}
          <div className="hidden overflow-x-auto rounded-3xl border border-border bg-card lg:block">
            <table className="w-full min-w-287.5 table-fixed text-sm">
              <colgroup>
                <col className="w-32.5" />
                <col />
                <col className="w-37.5" />
                <col className="w-30" />
                <col className="w-37.5" />
                <col className="w-42.5" />
                <col className="w-22.5" />
                <col className="w-42.5" />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-3 font-medium">Referencia</th>
                  <th className="px-3 py-3 font-medium">Cliente</th>
                  <th className="px-3 py-3 text-right font-medium">Monto</th>
                  <th className="px-3 py-3 font-medium">Tipo</th>
                  <th className="px-3 py-3 font-medium">Estado</th>
                  <th className="px-3 py-3 font-medium">Creado</th>
                  <th className="px-3 py-3 font-medium">Correo</th>
                  <th className="px-3 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border/60 last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-3 py-3">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {r.referenceNumber}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="truncate font-medium text-foreground">
                        {r.customerName}
                      </p>
                      {r.customerEmail && (
                        <p className="truncate text-xs text-muted-foreground">
                          {r.customerEmail}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums text-foreground">
                      {formatDOPFromCents(r.amountCents)}
                    </td>
                    <td className="px-3 py-3">
                      <PaymentTypeBadge type={r.paymentType} />
                    </td>
                    <td className="px-3 py-3">
                      <SelectMenu
                        options={STATUS_OPTIONS}
                        value={r.status}
                        onChange={(v) => handleStatusChange(r.id, v)}
                        disabled={busyId === r.id}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-muted-foreground">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-3 py-3">
                      <EmailStatus status={r.emailDeliveryStatus} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailsRow(r)}
                          title="Ver detalles"
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Eye className="size-4" aria-hidden />
                        </button>
                        {r.status !== "paid" && (
                          <button
                            type="button"
                            onClick={() => setSendRow(r)}
                            disabled={busyId === r.id}
                            title={
                              r.paymentUrl
                                ? "Reenviar enlace de pago"
                                : "Enviar enlace de pago"
                            }
                            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
                          >
                            <Send className="size-3.5" aria-hidden />
                            {r.paymentUrl ? "Reenviar" : "Enviar"}
                          </button>
                        )}
                        {r.paymentUrl && (
                          <a
                            href={r.paymentUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Abrir enlace de pago"
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <ExternalLink className="size-4" aria-hidden />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(r.id, r.referenceNumber)}
                          disabled={busyId === r.id}
                          title="Eliminar"
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        >
                          {busyId === r.id ? (
                            <Loader2
                              className="size-4 animate-spin"
                              aria-hidden
                            />
                          ) : (
                            <Trash2 className="size-4" aria-hidden />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Cards (mobile) ── */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="rounded-3xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-primary">
                      {r.referenceNumber}
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {r.customerName}
                    </p>
                    {r.customerEmail && (
                      <p className="truncate text-xs text-muted-foreground">
                        {r.customerEmail}
                      </p>
                    )}
                    <div className="mt-2">
                      <PaymentTypeBadge type={r.paymentType} />
                    </div>
                  </div>
                  <p className="shrink-0 text-base font-bold text-foreground">
                    {formatDOPFromCents(r.amountCents)}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="w-40">
                    <SelectMenu
                      options={STATUS_OPTIONS}
                      value={r.status}
                      onChange={(v) => handleStatusChange(r.id, v)}
                      disabled={busyId === r.id}
                    />
                  </div>
                  <EmailStatus status={r.emailDeliveryStatus} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(r.createdAt)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDetailsRow(r)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Eye className="size-4" aria-hidden />
                    </button>
                    {r.status !== "paid" && (
                      <button
                        type="button"
                        onClick={() => setSendRow(r)}
                        disabled={busyId === r.id}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
                      >
                        <Send className="size-3.5" aria-hidden />
                        {r.paymentUrl ? "Reenviar" : "Enviar"}
                      </button>
                    )}
                    {r.paymentUrl && (
                      <a
                        href={r.paymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <ExternalLink className="size-4" aria-hidden />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.referenceNumber)}
                      disabled={busyId === r.id}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal: enviar/reenviar enlace para una solicitud existente */}
      {sendRow && (
        <SendLinkModal
          row={sendRow}
          busy={busyId === sendRow.id}
          onClose={() => setSendRow(null)}
          onSend={(url) => handleSend(sendRow.id, url)}
        />
      )}

      {/* Modal: ver todos los detalles de la solicitud y del cliente */}
      {detailsRow && (
        <PaymentDetailsModal
          row={detailsRow}
          onClose={() => setDetailsRow(null)}
        />
      )}

      {/* Modal: confirmar acciones destructivas (reemplaza window.confirm) */}
      {confirmState && (
        <ConfirmDialog
          state={confirmState}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}

/**
 * Modal de solo lectura con todos los detalles de una solicitud de pago y de
 * su cliente. Se abre con el ícono de ojo en la lista/tabla.
 */
function PaymentDetailsModal({
  row,
  onClose,
}: {
  row: AdminPaymentRequest;
  onClose: () => void;
}) {
  const statusMeta = paymentStatusMeta(row.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[16px] border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/60 p-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              Detalles de la solicitud
            </h2>
            <p className="mt-0.5 font-mono text-xs font-semibold text-primary">
              {row.referenceNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Cerrar"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {/* Resumen del pago */}
        <div className="space-y-3 border-b border-border/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {formatDOPFromCents(row.amountCents)}
            </p>
            <div className="flex items-center gap-2">
              <PaymentTypeBadge type={row.paymentType} />
              <Badge variant={statusMeta.badge}>{statusMeta.label}</Badge>
            </div>
          </div>
          {row.description && (
            <p className="text-sm text-muted-foreground">{row.description}</p>
          )}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <CustomerDetail
              icon={CalendarDays}
              label="Creado"
              value={formatDateTime(row.createdAt)}
            />
            <CustomerDetail
              icon={Send}
              label="Enviado"
              value={row.sentAt ? formatDateTime(row.sentAt) : "—"}
            />
            <CustomerDetail
              icon={Wallet}
              label="Pagado"
              value={row.paidAt ? formatDateTime(row.paidAt) : "—"}
            />
            <CustomerDetail
              icon={Mail}
              label="Correo"
              value={
                row.emailDeliveryStatus === "sent"
                  ? "Enviado"
                  : row.emailDeliveryStatus === "failed"
                    ? "Falló"
                    : "—"
              }
            />
          </div>
          {row.paymentUrl && (
            <a
              href={row.paymentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              Abrir enlace de pago
            </a>
          )}
        </div>

        {/* Datos del cliente (siempre visibles) */}
        <div className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Cliente
          </h3>
          <div className="space-y-2.5 rounded-[10px] border border-border bg-muted/20 p-3">
            <CustomerDetail
              icon={User}
              label="Nombre"
              value={row.customerName}
            />
            {row.customerUsername && (
              <CustomerDetail
                icon={User}
                label="Usuario"
                value={`@${row.customerUsername}`}
              />
            )}
            <CustomerDetail
              icon={Mail}
              label="Correo"
              value={row.customerEmail ?? "Sin correo registrado"}
            />
            <CustomerDetail
              icon={Phone}
              label="Teléfono"
              value={row.customerPhone ?? "—"}
            />
            <CustomerDetail
              icon={CalendarDays}
              label="Cliente desde"
              value={
                row.customerSince ? formatDateTime(row.customerSince) : "—"
              }
            />
            <CustomerDetail
              icon={IdCard}
              label="ID de usuario"
              value={row.userId}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2 border-t border-border/60 p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[10px] border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal para enviar el enlace de una solicitud YA existente (creada en el
 * checkout del cliente o manualmente). Los datos —cliente, monto, descripción—
 * ya vienen cargados; el admin solo pega el enlace y lo manda. Al enviar se
 * actualiza esa misma solicitud (no se crea una nueva) y el cliente lo ve en su
 * Centro de pagos.
 */
function SendLinkModal({
  row,
  busy,
  onClose,
  onSend,
}: {
  row: AdminPaymentRequest;
  busy: boolean;
  onClose: () => void;
  onSend: (url: string) => void;
}) {
  const [url, setUrl] = useState(row.paymentUrl ?? "");
  const [showMore, setShowMore] = useState(false);
  const valid = /^https?:\/\/.+/i.test(url.trim());
  const isResend = Boolean(row.paymentUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[16px] border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border/60 p-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">
              {isResend ? "Reenviar enlace de pago" : "Enviar enlace de pago"}
            </h2>
            <p className="mt-0.5 font-mono text-xs font-semibold text-primary">
              {row.referenceNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Cerrar"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        {/* Datos ya cargados de la solicitud */}
        <div className="space-y-3 border-b border-border/60 bg-muted/20 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {row.customerName}
              </p>
              {row.customerEmail && (
                <p className="truncate text-xs text-muted-foreground">
                  {row.customerEmail}
                </p>
              )}
            </div>
            <p className="shrink-0 text-xl font-bold tracking-tight text-foreground">
              {formatDOPFromCents(row.amountCents)}
            </p>
          </div>
          {row.description && (
            <p className="text-sm text-muted-foreground">{row.description}</p>
          )}

          {/* Ver más datos del usuario */}
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <IdCard className="size-3.5" aria-hidden />
            {showMore ? "Ocultar datos" : "Ver más datos"}
            <ChevronDown
              className={`size-3.5 transition-transform ${showMore ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>

          {showMore && (
            <div className="space-y-2.5 rounded-[10px] border border-border bg-card p-3">
              <CustomerDetail
                icon={User}
                label="Nombre"
                value={row.customerName}
              />
              {row.customerUsername && (
                <CustomerDetail
                  icon={User}
                  label="Usuario"
                  value={`@${row.customerUsername}`}
                />
              )}
              <CustomerDetail
                icon={Mail}
                label="Correo"
                value={row.customerEmail ?? "Sin correo registrado"}
              />
              <CustomerDetail
                icon={Phone}
                label="Teléfono"
                value={row.customerPhone ?? "—"}
              />
              <CustomerDetail
                icon={CalendarDays}
                label="Cliente desde"
                value={
                  row.customerSince ? formatDateTime(row.customerSince) : "—"
                }
              />
              <CustomerDetail
                icon={IdCard}
                label="ID de usuario"
                value={row.userId}
              />
            </div>
          )}
        </div>

        {/* Input del enlace */}
        <div className="p-5">
          <label
            htmlFor="send-url"
            className="mb-1.5 block text-[13px] font-medium text-foreground"
          >
            Enlace de pago (URL) <span className="text-destructive">*</span>
          </label>
          <Input
            id="send-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            // biome-ignore lint/a11y/noAutofocus: foco directo al único campo del modal
            autoFocus
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Genera o pega el enlace de pago. El cliente lo recibirá por correo y
            lo verá en su Centro de pagos.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2 border-t border-border/60 p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-[10px] border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSend(url.trim())}
            disabled={busy || !valid}
            className="inline-flex items-center gap-2 rounded-[18px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            {isResend ? "Reenviar" : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
        <Icon className="size-3" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
          {label}
        </p>
        <p className="break-all text-xs font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function EmailStatus({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-xs text-muted-foreground/60">—</span>;
  }
  const sent = status === "sent";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        sent ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
      }`}
    >
      <Mail className="size-3.5" aria-hidden />
      {sent ? "Enviado" : "Falló"}
    </span>
  );
}
