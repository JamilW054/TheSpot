"use client";

import { usePanelBase } from "@/lib/panel-base";
import {
  CheckCircle2,
  ChevronDown,
  Eye,
  ImageIcon,
  LayoutGrid,
  LayoutList,
  ListFilter,
  MapPin,
  MessageCircle,
  PackageSearch,
  Phone,
  PlayCircle,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { EmptyState } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog, type ConfirmDialogState } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { buildAdminOrderWhatsAppLink } from "@/lib/whatsapp";
import {
  DEFAULT_ORDER_STATUS_FILTER,
  ORDER_STATUS_FILTERS,
  type OrderStatusFilter,
  orderStatusFilterMeta,
} from "@/lib/orders/status";
import type {
  FilterEstado,
  Pedido,
  PedidoEstado,
  PedidosTableProps,
} from "@/types";
import type { PedidoLineItem, PedidoShipping } from "@/types/pedido";

// ─── Constants ───────────────────────────────────────────────────────────────

const ESTADO_LABEL: Record<PedidoEstado, string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  completado: "Completado",
};

const ESTADO_BADGE_VARIANT: Record<PedidoEstado, "default" | "warning" | "success"> = {
  pendiente: "warning",
  en_proceso: "default",
  completado: "success",
};

const PAYMENT_LABEL: Record<string, string> = {
  paid: "Pagado",
  pending: "Sin pagar",
  declined: "Rechazado",
};

const PAYMENT_COLOR: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  declined: "bg-red-500/10 text-red-600 border-red-500/20",
};

/** Opciones del filtro secundario por estado de gestión. */
const FILTER_ESTADO_OPTIONS: { value: FilterEstado; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "abiertos", label: "Abiertos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "completado", label: "Completado" },
];

const ESTADO_PANEL_ID = "pedidos-filtro-gestion";

const VIEW_KEY = "admin-pedidos-view";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function estadoMatches(filter: FilterEstado, estado: PedidoEstado): boolean {
  if (filter === "todos") return true;
  if (filter === "abiertos") return estado === "pendiente" || estado === "en_proceso";
  return estado === filter;
}

function filterEstadoLabel(filter: FilterEstado): string {
  return (
    FILTER_ESTADO_OPTIONS.find((o) => o.value === filter)?.label ?? "Todos"
  );
}

/**
 * Búsqueda + estado de gestión sobre los pedidos que ya devolvió la consulta
 * filtrada por cobro (ver `getOrdersAdmin`); ese eje no se filtra aquí.
 */
function filterPedidos(
  pedidos: Pedido[],
  q: string,
  estado: FilterEstado,
): Pedido[] {
  const query = q.trim().toLowerCase();
  if (query === "" && estado === "todos") return pedidos;
  return pedidos.filter((p) => {
    const matchSearch =
      query === "" ||
      p.id.toLowerCase().includes(query) ||
      p.cliente.toLowerCase().includes(query) ||
      (p.shipping?.email ?? "").toLowerCase().includes(query) ||
      (p.shipping?.phone ?? "").toLowerCase().includes(query);
    return matchSearch && estadoMatches(estado, p.estado);
  });
}

function toggleSet<T>(set: Set<T>, val: T): Set<T> {
  const next = new Set(set);
  if (next.has(val)) next.delete(val);
  else next.add(val);
  return next;
}

function formatAddress(s: PedidoShipping): string {
  return [s.addressLine1, s.addressLine2].filter(Boolean).join(", ") || "—";
}

function formatCityLine(s: PedidoShipping): string {
  const city = [s.city, s.postalCode].filter(Boolean).join(", ");
  const country = countryLabel(s.countryCode);
  return [city, country].filter(Boolean).join(" · ");
}

function countryLabel(code: string | null | undefined): string {
  if (!code) return "";
  const map: Record<string, string> = {
    DO: "Rep. Dominicana",
    US: "EE.UU.",
    ES: "España",
  };
  return map[code.toUpperCase()] ?? code.toUpperCase();
}

/** Enlace wa.me para que el admin le escriba al cliente sobre este pedido (null si no hay teléfono). */
function whatsappHrefForPedido(pedido: Pedido): string | null {
  const phone = pedido.shipping?.phone;
  if (!phone) return null;
  return buildAdminOrderWhatsAppLink(phone, {
    orderNumber: pedido.id.slice(0, 8).toUpperCase(),
    customerName: pedido.cliente,
    items: pedido.lineItems.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      size: i.size,
    })),
    totalCents: pedido.totalCents,
  });
}

function isExternalImage(src: string): boolean {
  if (!src) return false;
  return (
    src.includes("placehold.co") ||
    src.includes("imgur.com") ||
    src.includes("unsplash.com") ||
    src.startsWith("http")
  );
}

// ─── Status filter ───────────────────────────────────────────────────────────

/**
 * Filtro de estado en línea (Pagados / Pendientes / Cancelados). Un solo estado
 * activo a la vez; el cambio se delega al contenedor, que rehace la consulta.
 */
function OrderStatusFilterButtons({
  value,
  onChange,
  disabled = false,
}: {
  value: OrderStatusFilter;
  onChange: (status: OrderStatusFilter) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="flex w-full shrink-0 items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 sm:w-auto">
      <legend className="sr-only">Filtrar pedidos por estado</legend>
      {ORDER_STATUS_FILTERS.map((status) => {
        const active = status === value;
        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(status)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60 sm:flex-none ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {orderStatusFilterMeta(status).label}
          </button>
        );
      })}
    </fieldset>
  );
}

// ─── Product line items ─────────────────────────────────────────────────────────

/** Miniatura cuadrada del producto, con fallback a icono si no hay imagen. */
function ProductThumb({
  src,
  alt,
  size,
}: {
  src: string;
  alt: string;
  size: number;
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${size}px`}
          unoptimized={isExternalImage(src)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <ImageIcon className="size-1/2" />
        </div>
      )}
    </div>
  );
}

/** Fila de un producto del pedido: foto + nombre + talla/color + cantidad. */
function LineItemRow({ item }: { item: PedidoLineItem }) {
  return (
    <div className="flex items-center gap-2.5">
      <ProductThumb src={item.coverImageUrl} alt={item.productName} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">
          {item.productName}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          {item.size && (
            <span className="rounded border border-border bg-background px-1.5 py-px text-[10px] font-medium text-muted-foreground">
              {item.size}
            </span>
          )}
          {item.color && (
            <span className="rounded border border-border bg-background px-1.5 py-px text-[10px] font-medium text-muted-foreground">
              {item.color}
            </span>
          )}
        </div>
      </div>
      <span className="shrink-0 font-mono text-xs font-semibold text-foreground tabular-nums">
        ×{item.quantity}
      </span>
    </div>
  );
}

/** Lista de productos del pedido para la card; colapsa el sobrante. */
function ProductList({
  items,
  max = 3,
}: {
  items: PedidoLineItem[];
  max?: number;
}) {
  if (items.length === 0) return null;
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <div className="mx-4 mb-3 space-y-2 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Productos
      </p>
      {shown.map((item, i) => (
        <LineItemRow key={i} item={item} />
      ))}
      {extra > 0 && (
        <p className="pl-[50px] text-[11px] font-medium text-muted-foreground">
          + {extra} producto{extra > 1 ? "s" : ""} más
        </p>
      )}
    </div>
  );
}

// ─── Card View ────────────────────────────────────────────────────────────────

function PedidoCard({
  pedido,
  selected,
  onToggle,
  onView,
  onMarkEnProceso,
  onMarkCompletado,
  onDelete,
}: {
  pedido: Pedido;
  selected: boolean;
  onToggle: () => void;
  onView: () => void;
  onMarkEnProceso?: () => void;
  onMarkCompletado?: () => void;
  onDelete?: () => void;
}) {
  const panelBase = usePanelBase();
  const s = pedido.shipping;
  const canDelete = pedido.paymentStatus !== "paid";
  const hasAddress = s && (s.addressLine1 || s.city);
  const whatsappHref = whatsappHrefForPedido(pedido);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors ${
        selected ? "border-primary/50 bg-primary/5" : "border-border"
      }`}
    >
      {/* Header: checkbox + nombre + acciones */}
      <div className="flex min-w-0 items-start gap-2.5 px-4 pt-4 pb-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Seleccionar pedido de ${pedido.cliente}`}
          className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
        />

        <div className="min-w-0 flex-1">
          {/* Nombre */}
          <Link
            href={`${panelBase}/pedidos/${pedido.id}`}
            className="block truncate font-semibold leading-snug text-foreground hover:text-primary"
          >
            {pedido.cliente}
            <span className="ml-1.5 font-mono text-xs font-normal text-muted-foreground">
              #{pedido.id.slice(0, 8).toUpperCase()}
            </span>
          </Link>
          {pedido.tienda && panelBase === "/admin" ? (
            <p className="truncate text-xs font-medium text-primary">{pedido.tienda}</p>
          ) : null}
          {/* Email */}
          {s?.email && (
            <p className="truncate text-xs text-muted-foreground mt-0.5">{s.email}</p>
          )}
          {/* Badges + fecha */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant={ESTADO_BADGE_VARIANT[pedido.estado]}>
              {ESTADO_LABEL[pedido.estado]}
            </Badge>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PAYMENT_COLOR[pedido.paymentStatus] ?? PAYMENT_COLOR.pending}`}
            >
              {PAYMENT_LABEL[pedido.paymentStatus] ?? "—"}
            </span>
          </div>
          {pedido.createdAt && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">{pedido.createdAt}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 flex-col gap-1">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              title="Escribir por WhatsApp"
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:border-[#25D366]/50 hover:text-[#25D366] transition-colors"
            >
              <MessageCircle className="size-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={onView}
            title="Ver detalles"
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Eye className="size-3.5" />
          </button>
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Eliminar pedido"
              className="flex size-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors"
            >
              <Trash2 className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Productos pedidos */}
      <ProductList items={pedido.lineItems} />

      {/* Dirección */}
      {hasAddress && (
        <div className="mx-4 mb-3 overflow-hidden rounded-xl bg-muted/40 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-foreground">{formatAddress(s)}</p>
              {(s.city || s.postalCode || s.countryCode) && (
                <p className="truncate text-[11px] text-muted-foreground">
                  {formatCityLine(s)}
                </p>
              )}
            </div>
          </div>
          {s.phone && (
            <div className="mt-1.5 flex items-center gap-2">
              <Phone className="size-3.5 shrink-0 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">{s.phone}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer: total + acciones */}
      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {pedido.items} {pedido.items === 1 ? "producto" : "productos"}
        </span>
        <span className="ml-auto font-mono text-sm font-semibold text-foreground">
          {pedido.total}
        </span>
        {onMarkEnProceso && (
          <button
            type="button"
            onClick={onMarkEnProceso}
            title="Marcar en proceso"
            className="flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <PlayCircle className="size-3.5" />
          </button>
        )}
        {onMarkCompletado && (
          <button
            type="button"
            onClick={onMarkCompletado}
            title="Marcar completado"
            className="flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2 text-xs text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-600 transition-colors"
          >
            <CheckCircle2 className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Table View ───────────────────────────────────────────────────────────────

function PedidosTableView({
  pedidos,
  selectedIds,
  onToggleRow,
  onSelectAll,
  onView,
  onDelete,
}: {
  pedidos: Pedido[];
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onView: (p: Pedido) => void;
  onDelete?: (p: Pedido) => void;
}) {
  const panelBase = usePanelBase();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const allChecked = pedidos.length > 0 && pedidos.every((p) => selectedIds.has(p.id));
  const someChecked = selectedIds.size > 0;

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someChecked && !allChecked;
  }, [someChecked, allChecked]);

  if (pedidos.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
        No hay pedidos
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-175 border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th scope="col" className="w-10 px-3 py-3">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allChecked}
                onChange={(e) => onSelectAll(e.target.checked)}
                aria-label="Seleccionar todos"
                className="size-4 rounded border-border accent-primary"
              />
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-foreground">Cliente</th>
            <th scope="col" className="px-4 py-3 font-medium text-foreground">Dirección</th>
            <th scope="col" className="px-4 py-3 font-medium text-foreground">Items</th>
            <th scope="col" className="px-4 py-3 font-medium text-foreground">Total</th>
            <th scope="col" className="px-4 py-3 font-medium text-foreground">Estado</th>
            <th scope="col" className="px-4 py-3 font-medium text-foreground">Pago</th>
            <th scope="col" className="px-4 py-3 font-medium text-foreground">Fecha</th>
            <th scope="col" className="w-20 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => {
            const s = p.shipping;
            const canDelete = p.paymentStatus !== "paid";
            return (
              <tr
                key={p.id}
                className="border-b border-border transition-colors hover:bg-muted/20 last:border-0"
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => onToggleRow(p.id)}
                    aria-label={`Seleccionar pedido de ${p.cliente}`}
                    className="size-4 rounded border-border accent-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`${panelBase}/pedidos/${p.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {p.cliente}{" "}
                    <span className="font-mono text-xs font-normal text-muted-foreground">
                      #{p.id.slice(0, 8).toUpperCase()}
                    </span>
                  </Link>
                  {s?.email && (
                    <p className="truncate text-xs text-muted-foreground max-w-40">{s.email}</p>
                  )}
                  {s?.phone && (
                    <p className="text-xs text-muted-foreground">{s.phone}</p>
                  )}
                </td>
                <td className="px-4 py-3 max-w-50">
                  {s?.addressLine1 ? (
                    <>
                      <p className="truncate text-sm text-foreground">{formatAddress(s)}</p>
                      <p className="truncate text-xs text-muted-foreground">{formatCityLine(s)}</p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.lineItems.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {p.lineItems.slice(0, 3).map((item, i) => (
                          <div key={i} className="ring-2 ring-card rounded-lg">
                            <ProductThumb
                              src={item.coverImageUrl}
                              alt={item.productName}
                              size={32}
                            />
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {p.items}
                      </span>
                    </div>
                  ) : (
                    <span className="tabular-nums text-foreground">{p.items}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-foreground">{p.total}</td>
                <td className="px-4 py-3">
                  <Badge variant={ESTADO_BADGE_VARIANT[p.estado]}>
                    {ESTADO_LABEL[p.estado]}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${PAYMENT_COLOR[p.paymentStatus] ?? PAYMENT_COLOR.pending}`}
                  >
                    {PAYMENT_LABEL[p.paymentStatus] ?? "—"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                  {p.createdAt ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {whatsappHrefForPedido(p) && (
                      <a
                        href={whatsappHrefForPedido(p) ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Escribir por WhatsApp"
                        className="flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-[#25D366]/50 hover:text-[#25D366] transition-colors"
                      >
                        <MessageCircle className="size-3.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => onView(p)}
                      title="Ver detalles"
                      className="flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      <Eye className="size-3.5" />
                    </button>
                    {canDelete && onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(p)}
                        title="Eliminar pedido"
                        className="flex size-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PedidosTable({
  pedidos,
  withFilters = false,
  statusFilter = DEFAULT_ORDER_STATUS_FILTER,
  onStatusFilterChange,
  isRefreshing = false,
  onMarkEnProceso,
  onMarkCompletado,
  onDelete,
}: PedidosTableProps) {
  const panelBase = usePanelBase();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<FilterEstado>("todos");
  const [showEstadoPanel, setShowEstadoPanel] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"cards" | "table">("cards");
  const router = useRouter();
  const openDetail = useCallback(
    (p: Pedido) => router.push(`${panelBase}/pedidos/${p.id}`),
    [router, panelBase],
  );
  const [confirmState, setConfirmState] = useState<ConfirmDialogState | null>(null);

  // Persist view preference
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_KEY);
    if (saved === "cards" || saved === "table") setView(saved);
  }, []);
  const switchView = (v: "cards" | "table") => {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  };

  const estadoActivo = filterEstado !== "todos";

  const filtered = useMemo(
    () =>
      withFilters ? filterPedidos(pedidos, searchQuery, filterEstado) : pedidos,
    [pedidos, searchQuery, filterEstado, withFilters],
  );

  // Al cambiar el conjunto de pedidos (otro estado, recarga tras una acción)
  // se descarta la selección que ya no está en pantalla.
  useEffect(() => {
    const visibles = new Set(pedidos.map((p) => p.id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => visibles.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [pedidos]);

  const handleToggleRow = (id: string) => setSelectedIds((prev) => toggleSet(prev, id));
  const handleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? new Set(filtered.map((p) => p.id)) : new Set());

  const showConfirm = useCallback((opts: ConfirmDialogState) => setConfirmState(opts), []);
  const closeConfirm = useCallback(() => setConfirmState(null), []);

  // ── Bulk: marcar en proceso
  const handleMarkEnProceso = () => {
    const ids = Array.from(selectedIds);
    showConfirm({
      title: "¿Marcar en proceso?",
      description: `Se actualizarán ${ids.length} ${ids.length === 1 ? "pedido" : "pedidos"} a estado "En proceso".`,
      confirmLabel: "Marcar en proceso",
      variant: "default",
      onConfirm: () => {
        closeConfirm();
        onMarkEnProceso?.(ids);
        setSelectedIds(new Set());
      },
    });
  };

  // ── Bulk: marcar completado
  const handleMarkCompletado = () => {
    const ids = Array.from(selectedIds);
    showConfirm({
      title: "¿Marcar como completado?",
      description: `Se marcarán ${ids.length} ${ids.length === 1 ? "pedido" : "pedidos"} como completados.`,
      confirmLabel: "Completar",
      variant: "default",
      onConfirm: () => {
        closeConfirm();
        onMarkCompletado?.(ids);
        setSelectedIds(new Set());
      },
    });
  };

  // ── Bulk: eliminar seleccionados
  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    const selected = filtered.filter((p) => ids.includes(p.id));
    const deletable = selected.filter((p) => p.paymentStatus !== "paid");
    const skipped = selected.length - deletable.length;

    if (deletable.length === 0) {
      showConfirm({
        title: "No se puede eliminar",
        description: "Todos los pedidos seleccionados ya están pagados y no pueden eliminarse.",
        confirmLabel: "Entendido",
        variant: "default",
        onConfirm: closeConfirm,
      });
      return;
    }

    const skippedNote =
      skipped > 0
        ? ` ${skipped} pedido${skipped > 1 ? "s" : ""} pagado${skipped > 1 ? "s" : ""} no se eliminará${skipped > 1 ? "n" : ""}.`
        : "";

    showConfirm({
      title: "¿Eliminar pedidos?",
      description: `Se eliminarán ${deletable.length} pedido${deletable.length > 1 ? "s" : ""} sin pagar. Esta acción no se puede deshacer.${skippedNote}`,
      confirmLabel: `Eliminar ${deletable.length}`,
      variant: "danger",
      onConfirm: async () => {
        closeConfirm();
        for (const p of deletable) {
          await onDelete?.(p.id);
        }
        setSelectedIds(new Set());
      },
    });
  };

  // ── Single delete
  const handleDeleteSingle = (p: Pedido) => {
    showConfirm({
      title: "¿Eliminar pedido?",
      description: `Se eliminará el pedido de "${p.cliente}". Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      variant: "danger",
      onConfirm: async () => {
        closeConfirm();
        await onDelete?.(p.id);
      },
    });
  };

  // ── Single mark from card
  const handleCardMarkEnProceso = (p: Pedido) => {
    showConfirm({
      title: "¿Marcar en proceso?",
      description: `Se actualizará el pedido de "${p.cliente}" a "En proceso".`,
      confirmLabel: "Marcar",
      variant: "default",
      onConfirm: () => {
        closeConfirm();
        onMarkEnProceso?.([p.id]);
      },
    });
  };

  const handleCardMarkCompletado = (p: Pedido) => {
    showConfirm({
      title: "¿Marcar como completado?",
      description: `Se marcará el pedido de "${p.cliente}" como completado.`,
      confirmLabel: "Completar",
      variant: "default",
      onConfirm: () => {
        closeConfirm();
        onMarkCompletado?.([p.id]);
      },
    });
  };

  return (
    <>
      {/* Modals */}
      {confirmState && (
        <ConfirmDialog state={confirmState} onCancel={closeConfirm} />
      )}

      <div className="space-y-4">
        {withFilters && (
          <>
            {/* Search + filter + view toggle */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 sm:max-w-xs">
                <Input
                  type="search"
                  placeholder="Buscar por cliente, email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Buscar pedidos"
                />
              </div>
              <OrderStatusFilterButtons
                value={statusFilter}
                onChange={(s) => onStatusFilterChange?.(s)}
                disabled={isRefreshing || !onStatusFilterChange}
              />
              {/* Acceso al filtro secundario por estado de gestión. Cuando hay
                  uno activo el botón lo muestra, para que nunca se filtre sin
                  que se vea. */}
              <button
                type="button"
                onClick={() => setShowEstadoPanel((v) => !v)}
                aria-expanded={showEstadoPanel}
                aria-controls={ESTADO_PANEL_ID}
                className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors ${
                  estadoActivo
                    ? "border-primary/50 bg-primary/5 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <ListFilter className="size-3.5" aria-hidden />
                {estadoActivo ? filterEstadoLabel(filterEstado) : "Más estados"}
                <ChevronDown
                  className={`size-3.5 transition-transform ${showEstadoPanel ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {/* View toggle */}
              <div className="ml-auto flex shrink-0 items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
                <button
                  type="button"
                  onClick={() => switchView("cards")}
                  title="Vista tarjetas"
                  className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                    view === "cards"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => switchView("table")}
                  title="Vista tabla"
                  className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
                    view === "table"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutList className="size-4" />
                </button>
              </div>
            </div>

            {/* Filtro secundario: estado de gestión sobre el resultado actual */}
            {showEstadoPanel && (
              <div
                id={ESTADO_PANEL_ID}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5"
              >
                <label
                  htmlFor="filtro-estado-gestion"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Estado de gestión
                </label>
                <div className="w-44">
                  <SelectMenu
                    id="filtro-estado-gestion"
                    value={filterEstado}
                    onChange={(v) => setFilterEstado(v as FilterEstado)}
                    options={FILTER_ESTADO_OPTIONS}
                  />
                </div>
                {estadoActivo && (
                  <button
                    type="button"
                    onClick={() => setFilterEstado("todos")}
                    className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    Quitar filtro
                  </button>
                )}
                <p className="w-full text-xs text-muted-foreground sm:w-auto">
                  Se aplica sobre los pedidos{" "}
                  {orderStatusFilterMeta(statusFilter).label.toLowerCase()}.
                </p>
              </div>
            )}

            {/* Count + selection info */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {filtered.length > 0 && (
                <p className="text-muted-foreground">
                  {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
                </p>
              )}
              {selectedIds.size > 0 && (
                <p className="font-medium text-foreground">
                  {selectedIds.size} {selectedIds.size === 1 ? "seleccionado" : "seleccionados"}
                </p>
              )}
            </div>

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
                <span className="mr-1 text-xs text-muted-foreground">
                  {selectedIds.size} {selectedIds.size === 1 ? "pedido" : "pedidos"}:
                </span>
                <button
                  type="button"
                  onClick={handleMarkEnProceso}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <PlayCircle className="size-3.5" />
                  En proceso
                </button>
                <button
                  type="button"
                  onClick={handleMarkCompletado}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  <CheckCircle2 className="size-3.5" />
                  Completado
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors ml-auto"
                  >
                    <Trash2 className="size-3.5" />
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {filtered.length === 0 && withFilters ? (
          <div className="rounded-xl border border-border bg-muted/20">
            <EmptyState
              icon={<PackageSearch className="size-6" />}
              title={
                searchQuery.trim() || estadoActivo
                  ? "Sin resultados"
                  : orderStatusFilterMeta(statusFilter).emptyTitle
              }
              description={
                searchQuery.trim() || estadoActivo
                  ? `Ningún pedido ${orderStatusFilterMeta(statusFilter).label.toLowerCase()} coincide con estos filtros.`
                  : "Prueba con otro estado para ver más pedidos."
              }
              action={
                estadoActivo ? (
                  <button
                    type="button"
                    onClick={() => setFilterEstado("todos")}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    Quitar filtro de gestión
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <PedidoCard
                key={p.id}
                pedido={p}
                selected={selectedIds.has(p.id)}
                onToggle={() => handleToggleRow(p.id)}
                onView={() => openDetail(p)}
                onMarkEnProceso={
                  onMarkEnProceso ? () => handleCardMarkEnProceso(p) : undefined
                }
                onMarkCompletado={
                  onMarkCompletado ? () => handleCardMarkCompletado(p) : undefined
                }
                onDelete={onDelete ? () => handleDeleteSingle(p) : undefined}
              />
            ))}
          </div>
        ) : (
          <PedidosTableView
            pedidos={filtered}
            selectedIds={selectedIds}
            onToggleRow={handleToggleRow}
            onSelectAll={handleSelectAll}
            onView={openDetail}
            onDelete={onDelete ? handleDeleteSingle : undefined}
          />
        )}
      </div>
    </>
  );
}
