"use client";

import { usePanelBase } from "@/lib/panel-base";
import {
  Banknote,
  Check,
  CircleDollarSign,
  Clock,
  FileText,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  StickyNote,
  Trash2,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AdminBadge,
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
  AdminPageHeader,
} from "@/components/admin/ui";
import { ConfirmDialog, type ConfirmDialogState } from "@/components/ui/confirm-dialog";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import type { OrderAdminDetail } from "@/database/repositories/order-detail";
import {
  adminDeleteOrder,
  adminSetOrderPaid,
  adminSetOrderStatus,
  adminUpdateOrderNotes,
} from "@/lib/actions/orders-admin";
import { formatDOPFromCents } from "@/lib/format-currency";
import {
  ORDER_STATUS_HINT,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
} from "@/lib/orders/labels";
import { buildAdminOrderWhatsAppLink } from "@/lib/whatsapp";

const fmt = formatDOPFromCents;

/** Flujo normal del pedido (los estados de cierre van aparte). */
const FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;

function when(iso: string): string {
  return new Date(iso).toLocaleString("es-DO", {
    timeZone: "America/Santo_Domingo",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrderDetailClient({ order }: { order: OrderAdminDetail }) {
  const panelBase = usePanelBase();
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState(order.adminNotes ?? "");
  const [confirm, setConfirm] = useState<ConfirmDialogState | null>(null);

  const paid = order.paymentStatus === "paid";
  const closed = order.status === "cancelled" || order.status === "refunded";
  const flowIndex = FLOW.indexOf(order.status as (typeof FLOW)[number]);
  const profit = order.subtotalCents - order.discountCents - order.costCents;

  const run = (key: string, fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) => {
    setBusy(key);
    start(async () => {
      const res = await fn();
      setBusy(null);
      if (!res.ok) {
        showError(res.error ?? "No se pudo guardar.");
        return;
      }
      showSuccess(msg);
      router.refresh();
    });
  };

  const changeStatus = (status: string) => {
    const label = ORDER_STATUS_LABEL[status];
    const needsConfirm = status === "cancelled" || status === "refunded";
    const go = () =>
      run(`status:${status}`, () => adminSetOrderStatus(order.id, status), `Pedido marcado como ${label}.`);
    if (!needsConfirm) return go();
    setConfirm({
      title: `¿Marcar como ${label}?`,
      description: ORDER_STATUS_HINT[status],
      confirmLabel: `Sí, ${label.toLowerCase()}`,
      variant: "danger",
      onConfirm: () => {
        setConfirm(null);
        go();
      },
    } as ConfirmDialogState);
  };

  const whatsapp = order.phone
    ? buildAdminOrderWhatsAppLink(order.phone, {
        orderNumber: order.number,
        customerName: order.customerName,
        items: order.items.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          size: i.size,
        })),
        totalCents: order.totalCents,
        paymentMethod: order.paymentMethodLabel,
        bankName: order.bankAccount?.bankName ?? null,
      })
    : null;

  const addressLines = [
    order.address?.address_line1,
    order.address?.address_line2,
    [order.address?.city, order.address?.state, order.address?.postal_code]
      .filter(Boolean)
      .join(", "),
    order.address?.country_code,
  ].filter((l): l is string => Boolean(l?.trim()));

  return (
    <div className="space-y-6">
      {confirm ? (
        <ConfirmDialog state={confirm} onCancel={() => setConfirm(null)} />
      ) : null}

      <AdminPageHeader
        title={`Pedido #${order.number}`}
        description={`Creado el ${when(order.createdAt)} · ${order.items.reduce((s, i) => s + i.quantity, 0)} unidades`}
        breadcrumbs={[
          { label: "Dashboard", href: `${panelBase}` },
          { label: "Pedidos", href: `${panelBase}/pedidos?estado=pending` },
          { label: `#${order.number}` },
        ]}
        actions={
          <>
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white hover:opacity-90"
              >
                <MessageCircle className="size-4" aria-hidden />
                WhatsApp
              </a>
            ) : null}
            <a
              href={`/api/admin/pedidos/${order.id}/pdf`}
              target="_blank"
              rel="noopener"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium hover:border-primary"
            >
              <FileText className="size-4" aria-hidden />
              PDF
            </a>
          </>
        }
      />

      {/* Estado */}
      <AdminCard>
        <AdminCardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <AdminBadge tone={ORDER_STATUS_TONE[order.status] ?? "neutral"} dot>
              {ORDER_STATUS_LABEL[order.status] ?? order.status}
            </AdminBadge>
            <AdminBadge tone={paid ? "success" : "warning"} dot>
              {paid ? "Pagado" : "Pendiente de pago"}
            </AdminBadge>
            <AdminBadge tone="neutral">{order.paymentMethodLabel}</AdminBadge>
            <span className="text-xs text-muted-foreground">
              {ORDER_STATUS_HINT[order.status]}
            </span>
          </div>

          {/* Stepper clickeable */}
          <ol className="grid grid-cols-5 gap-1.5">
            {FLOW.map((st, i) => {
              const done = !closed && flowIndex >= i;
              const current = order.status === st;
              const loading = busy === `status:${st}`;
              return (
                <li key={st}>
                  <button
                    type="button"
                    disabled={pending || current}
                    onClick={() => changeStatus(st)}
                    title={ORDER_STATUS_HINT[st]}
                    className={`flex w-full flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-xs font-medium transition-colors disabled:cursor-default ${
                      current
                        ? "border-primary bg-primary text-primary-foreground"
                        : done
                          ? "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`flex size-6 items-center justify-center rounded-full text-[11px] ${
                        current ? "bg-white/20" : done ? "bg-primary/15" : "bg-muted"
                      }`}
                    >
                      {loading ? (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      ) : done ? (
                        <Check className="size-3.5" aria-hidden />
                      ) : (
                        i + 1
                      )}
                    </span>
                    {ORDER_STATUS_LABEL[st]}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {paid ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => run("unpay", () => adminSetOrderPaid(order.id, false), "Pago marcado como pendiente.")}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium hover:border-primary disabled:opacity-50"
              >
                <Undo2 className="size-4" aria-hidden />
                Marcar como no pagado
              </button>
            ) : (
              <button
                type="button"
                disabled={pending || closed}
                onClick={() => run("pay", () => adminSetOrderPaid(order.id, true), "Pago confirmado. Se envió el recibo al cliente.")}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {busy === "pay" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <CircleDollarSign className="size-4" aria-hidden />
                )}
                Confirmar pago recibido
              </button>
            )}
            {!closed ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => changeStatus("cancelled")}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-red-300 px-4 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                Cancelar pedido
              </button>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => changeStatus("pending")}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium hover:border-primary disabled:opacity-50"
              >
                <Undo2 className="size-4" aria-hidden />
                Reactivar pedido
              </button>
            )}
            {order.status === "delivered" && paid ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => changeStatus("refunded")}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium hover:border-primary disabled:opacity-50"
              >
                Registrar devolución
              </button>
            ) : null}
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                setConfirm({
                  title: `¿Eliminar el pedido #${order.number}?`,
                  description:
                    "Se borra de forma permanente con su historial. El stock reservado se libera. Esta acción no se puede deshacer.",
                  confirmLabel: "Eliminar",
                  variant: "danger",
                  onConfirm: async () => {
                    setConfirm(null);
                    try {
                      await adminDeleteOrder(order.id);
                      showSuccess("Pedido eliminado.");
                      router.replace(`${panelBase}/pedidos?estado=pending`);
                    } catch (e) {
                      showError(e instanceof Error ? e.message : "No se pudo eliminar.");
                    }
                  },
                } as ConfirmDialogState)
              }
              className="ml-auto inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 className="size-4" aria-hidden />
              Eliminar
            </button>
          </div>
          {order.paymentMethod === "cash_on_delivery" && !paid ? (
            <p className="text-xs text-muted-foreground">
              Contra entrega: al marcarlo como <strong>Entregado</strong> el
              pago se registra automáticamente.
            </p>
          ) : null}
        </AdminCardContent>
      </AdminCard>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Productos */}
          <AdminCard className="overflow-hidden">
            <AdminCardHeader>
              <AdminCardTitle>Productos</AdminCardTitle>
              <span className="text-xs text-muted-foreground">
                {order.items.length} líneas
              </span>
            </AdminCardHeader>
            <ul className="divide-y divide-border">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {it.coverImage ? (
                      // biome-ignore lint/performance/noImgElement: miniatura de cualquier origen
                      <img src={it.coverImage} alt="" className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    {it.productSlug ? (
                      <Link
                        href={`${panelBase}/catalogo/${it.productSlug}/editar`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {it.productName}
                      </Link>
                    ) : (
                      <p className="font-medium">{it.productName}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {[it.size, it.color].filter(Boolean).join(" · ") || "Única"}
                      {it.sku ? ` · SKU ${it.sku}` : ""}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-mono tabular-nums text-muted-foreground">
                      {it.quantity} × {fmt(it.unitPriceCents)}
                    </p>
                    <p className="font-mono font-semibold tabular-nums">{fmt(it.totalCents)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-border bg-muted/20 px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-mono tabular-nums">{fmt(order.subtotalCents)}</dd>
              </div>
              {order.discountCents > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Descuento{order.couponCode ? ` (cupón ${order.couponCode})` : ""}
                  </dt>
                  <dd className="font-mono tabular-nums text-primary">−{fmt(order.discountCents)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Envío{order.shippingMethodName ? ` · ${order.shippingMethodName}` : ""}
                </dt>
                <dd className="font-mono tabular-nums">
                  {order.shippingCents === 0 ? "Gratis" : fmt(order.shippingCents)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="font-mono tabular-nums text-primary">{fmt(order.totalCents)}</dd>
              </div>
              <div className="flex justify-between pt-1 text-xs text-muted-foreground">
                <dt>Costo de mercancía · Ganancia</dt>
                <dd className="font-mono tabular-nums">
                  {fmt(order.costCents)} · {fmt(profit)}
                </dd>
              </div>
            </dl>
          </AdminCard>

          {/* Notas */}
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle className="flex items-center gap-2">
                <StickyNote className="size-4" aria-hidden />
                Notas
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Del cliente
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {order.notes || <span className="text-muted-foreground">Sin notas.</span>}
                </p>
              </div>
              <div>
                <label
                  htmlFor="admin-notes"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Internas (solo el equipo las ve)
                </label>
                <textarea
                  id="admin-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Entregar después de las 5 pm, pagó con billetes de 2000…"
                  className="mt-1 w-full rounded-[10px] border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  disabled={pending || notes === (order.adminNotes ?? "")}
                  onClick={() => run("notes", () => adminUpdateOrderNotes(order.id, notes), "Notas guardadas.")}
                  className="mt-2 inline-flex h-8 items-center rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-40"
                >
                  Guardar notas
                </button>
              </div>
            </AdminCardContent>
          </AdminCard>
        </div>

        <div className="space-y-6">
          {/* Cliente */}
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>Cliente</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent className="space-y-3 text-sm">
              <p className="font-semibold">{order.customerName}</p>
              {order.phone ? (
                <a href={`tel:${order.phone}`} className="flex items-center gap-2 hover:text-primary">
                  <Phone className="size-4 text-muted-foreground" aria-hidden />
                  {order.phone}
                </a>
              ) : null}
              {order.email ? (
                <a href={`mailto:${order.email}`} className="flex items-center gap-2 break-all hover:text-primary">
                  <Mail className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  {order.email}
                </a>
              ) : null}
              {addressLines.length > 0 ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLines.join(", "))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:text-primary"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span>
                    {addressLines.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </span>
                </a>
              ) : null}
            </AdminCardContent>
          </AdminCard>

          {/* Pago */}
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>Pago</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                {order.paymentMethod === "bank_transfer" ? (
                  <Landmark className="size-4 text-muted-foreground" aria-hidden />
                ) : (
                  <Banknote className="size-4 text-muted-foreground" aria-hidden />
                )}
                {order.paymentMethodLabel}
              </p>
              {order.bankAccount ? (
                <div className="rounded-xl bg-muted/40 p-3 text-xs">
                  <p className="font-semibold">{order.bankAccount.bankName}</p>
                  <p className="font-mono">
                    {order.bankAccount.accountType} {order.bankAccount.accountNumber}
                  </p>
                  <p className="text-muted-foreground">{order.bankAccount.holderName}</p>
                </div>
              ) : null}
              <p className="text-muted-foreground">
                {paid && order.paidAt
                  ? `Cobrado el ${when(order.paidAt)}`
                  : "Aún no se ha registrado el cobro."}
              </p>
            </AdminCardContent>
          </AdminCard>

          {/* Historial */}
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle className="flex items-center gap-2">
                <Clock className="size-4" aria-hidden />
                Historial
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {order.history.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin movimientos.</p>
              ) : (
                <ol className="relative space-y-4 border-l border-border pl-4">
                  {order.history.map((h) => (
                    <li key={h.id} className="text-sm">
                      <span className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full bg-primary" />
                      <p className="font-medium">{h.note || ORDER_STATUS_LABEL[h.status] || h.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {when(h.createdAt)} · {h.byAdmin ? "Admin" : "Sistema"}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </AdminCardContent>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
