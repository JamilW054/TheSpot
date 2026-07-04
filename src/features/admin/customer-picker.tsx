"use client";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  IdCard,
  Mail,
  Phone,
  Search,
  User,
  X,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { formatDateTime } from "@/lib/format-date";

export interface CustomerOption {
  id: string;
  display: string;
  email: string | null;
  username: string | null;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
  /** Tiene una solicitud de pago en curso (pending/link_sent/in_process). */
  hasActivePayment: boolean;
}

const PAGE_SIZE = 6;

/**
 * Selector de cliente con búsqueda (lupa), paginación y filtro "con pago
 * activo". Sustituye al desplegable plano cuando la lista de clientes crece.
 * Envía el id elegido en un `<input hidden name>` para el formulario.
 */
export function CustomerPicker({
  customers,
  name = "user_id",
}: {
  customers: CustomerOption[];
  name?: string;
}) {
  const fieldId = useId();
  const [query, setQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);

  const activeCount = useMemo(
    () => customers.filter((c) => c.hasActivePayment).length,
    [customers],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (onlyActive && !c.hasActivePayment) return false;
      if (q === "") return true;
      return (
        c.display.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [customers, query, onlyActive]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  // Búsqueda / filtro cambian → vuelve a la primera página.
  function resetToFirstPage() {
    if (page !== 0) setPage(0);
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor={fieldId}
        className="block text-[13px] font-medium text-foreground"
      >
        Cliente <span className="text-destructive">*</span>
      </label>

      {/* Hidden value para el formulario (server action). */}
      <input type="hidden" name={name} value={selectedId} />

      {/* Cliente seleccionado */}
      {selected ? (
        <div className="rounded-[10px] border border-primary/40 bg-primary/5 px-3 py-2.5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <User className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {selected.display}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {selected.email ?? "Sin correo registrado"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId("")}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Cambiar cliente"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            {selected.hasActivePayment ? (
              <span className="text-[11px] font-medium text-primary">
                Pago activo
              </span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <IdCard className="size-3.5" aria-hidden />
              Ver más datos
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Buscador */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              id={fieldId}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetToFirstPage();
              }}
              placeholder="Buscar cliente por nombre…"
              className="h-11 w-full rounded-[10px] border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Filtro pago activo */}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setOnlyActive((v) => !v);
                resetToFirstPage();
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                onlyActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              {onlyActive && <Check className="size-3.5" aria-hidden />}
              Con pago activo ({activeCount})
            </button>
          )}

          {/* Lista */}
          {pageItems.length === 0 ? (
            <p className="rounded-[10px] border border-border bg-card px-3 py-6 text-center text-sm text-muted-foreground">
              {customers.length === 0
                ? "No hay clientes disponibles."
                : "Sin clientes que coincidan."}
            </p>
          ) : (
            <ul className="divide-y divide-border/60 overflow-hidden rounded-[10px] border border-border bg-card">
              {pageItems.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                      <User className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {c.display}
                      </span>
                      {c.email && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {c.email}
                        </span>
                      )}
                    </span>
                    {c.hasActivePayment && (
                      <span className="shrink-0 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Pago activo
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Paginación */}
          {pageCount > 1 && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {filtered.length} cliente{filtered.length === 1 ? "" : "s"}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                <span className="min-w-16 text-center text-xs font-medium text-muted-foreground">
                  {safePage + 1} / {pageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={safePage >= pageCount - 1}
                  className="rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal: más datos del cliente seleccionado */}
      {showDetails && selected && (
        <CustomerDetailsModal
          customer={selected}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}

/** Panel con la ficha completa del cliente seleccionado. */
function CustomerDetailsModal({
  customer,
  onClose,
}: {
  customer: CustomerOption;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-[16px] border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/60 p-5">
          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-primary">
            {customer.avatarUrl ? (
              // biome-ignore lint/performance/noImgElement: avatar externo en modal admin
              <img
                src={customer.avatarUrl}
                alt={customer.display}
                className="size-full object-cover"
              />
            ) : (
              <User className="size-5" aria-hidden />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground">
              {customer.fullName ?? customer.display}
            </p>
            {customer.username && (
              <p className="truncate text-xs text-muted-foreground">
                @{customer.username}
              </p>
            )}
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

        {/* Datos */}
        <div className="space-y-3 p-5">
          {customer.hasActivePayment && (
            <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
              Pago activo
            </span>
          )}
          <DetailRow
            icon={Mail}
            label="Correo"
            value={customer.email ?? "Sin correo registrado"}
          />
          <DetailRow
            icon={Phone}
            label="Teléfono"
            value={customer.phone ?? "—"}
          />
          <DetailRow
            icon={CalendarDays}
            label="Cliente desde"
            value={
              customer.createdAt ? formatDateTime(customer.createdAt) : "—"
            }
          />
          <DetailRow icon={IdCard} label="ID de usuario" value={customer.id} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
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
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
          {label}
        </p>
        <p className="break-all text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
