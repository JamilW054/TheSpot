"use client";

import { CreditCard, Link2, Lock } from "lucide-react";
import { useId, useState } from "react";
import type { PaymentMethodOption } from "@/database/repositories/payments";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  payment_link: Link2,
  azul: CreditCard,
};

/** Etiquetas canónicas del selector (independientes del nombre en BD). */
const LABELS: Record<string, string> = {
  payment_link: "Payment Link",
  azul: "Pay with Azul",
};

/**
 * Selector de método de pago implementado como un grupo de radios accesible
 * (`role="radiogroup"` + `<input type="radio">`). El usuario debe elegir un
 * método explícitamente; "Payment Link" viene seleccionado por defecto.
 *
 * Los métodos deshabilitados (p.ej. Azul, pendiente de aprobación del proveedor)
 * se muestran con badge "Próximamente" y quedan no seleccionables.
 *
 * Funciona controlado (`value` + `onChange`, recibe el code del método) o sin
 * control (estado interno; el radio nativo envía el id en formularios).
 */
export function PaymentMethodSelector({
  methods,
  name = "payment_method_id",
  defaultValue,
  value,
  onChange,
}: {
  methods: PaymentMethodOption[];
  name?: string;
  defaultValue?: string;
  /** Controlado: code del método seleccionado. */
  value?: string;
  /** Controlado: recibe el code del método seleccionado. */
  onChange?: (code: string) => void;
}) {
  const groupId = useId();
  const selectable = methods.filter((m) => !m.isDisabled && m.isActive);
  const controlled = value !== undefined;
  const [internal, setInternal] = useState<string>(
    defaultValue ?? selectable[0]?.id ?? "",
  );
  const selectedId = controlled
    ? (methods.find((m) => m.code === value)?.id ?? "")
    : internal;

  const select = (method: PaymentMethodOption) => {
    if (onChange) onChange(method.code);
    if (!controlled) setInternal(method.id);
  };

  return (
    <div role="radiogroup" aria-label="Método de pago" className="space-y-2.5">
      {methods.map((method) => {
        const Icon = ICONS[method.code] ?? CreditCard;
        const disabled = method.isDisabled || !method.isActive;
        const active = selectedId === method.id;
        const inputId = `${groupId}-${method.code}`;
        return (
          <label
            key={method.id}
            htmlFor={inputId}
            aria-disabled={disabled}
            className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
              disabled
                ? "cursor-not-allowed border-border bg-muted/30 opacity-70"
                : active
                  ? "cursor-pointer border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "cursor-pointer border-border bg-card hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            {/* Radio real (accesible); el indicador visual va aparte. */}
            <input
              id={inputId}
              type="radio"
              name={name}
              value={method.id}
              checked={active}
              disabled={disabled}
              onChange={() => !disabled && select(method)}
              className="sr-only"
            />

            {/* Indicador del radio */}
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                active
                  ? "border-primary"
                  : disabled
                    ? "border-muted-foreground/30"
                    : "border-border"
              }`}
              aria-hidden
            >
              {active && <span className="size-2.5 rounded-full bg-primary" />}
            </span>

            {/* Icono del método */}
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                disabled
                  ? "bg-muted text-muted-foreground"
                  : active
                    ? "bg-primary/15 text-primary"
                    : "bg-muted/60 text-muted-foreground"
              }`}
            >
              {disabled ? (
                <Lock className="size-4" aria-hidden />
              ) : (
                <Icon className="size-5" aria-hidden />
              )}
            </span>

            {/* Texto */}
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {LABELS[method.code] ?? method.name}
                </span>
                {disabled ? (
                  <span className="rounded-md border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    {method.badgeLabel ?? "Próximamente"}
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {disabled
                  ? "No disponible — integración pendiente de aprobación."
                  : (method.description ?? "Disponible")}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
