"use client";

import {
  Clock,
  CreditCard,
  Info,
  Link2,
  Lock,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";
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

interface MethodExplanation {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  speed: string;
  points: string[];
}

/** Contenido del modal "Conocer más" — independiente de lo que venga de BD. */
const METHOD_EXPLANATIONS: Record<string, MethodExplanation> = {
  payment_link: {
    icon: Link2,
    title: "Payment Link",
    speed: "Confirmación manual (puede tardar más)",
    points: [
      "Te enviamos un enlace de pago seguro por correo a tu Centro de pagos.",
      "Es un proceso manual: nuestro equipo lo revisa antes de enviarlo, así que la confirmación no es instantánea.",
      "Ideal si prefieres pagar más tarde o coordinar el pago con tu banco.",
    ],
  },
  azul: {
    icon: CreditCard,
    title: "Pay with Azul",
    speed: "Confirmación automática e inmediata",
    points: [
      "Pagas con tarjeta de crédito o débito directamente en la página segura de Azul (Banco Popular).",
      "Tu pedido se confirma al instante — sin esperar revisión manual.",
      "Tus datos de tarjeta nunca pasan por nuestros servidores; los procesa Azul directamente.",
    ],
  },
};

function PaymentMethodInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-info-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p
            id="payment-info-title"
            className="text-[15px] font-semibold text-foreground"
          >
            ¿Cómo funciona cada método de pago?
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
          {Object.values(METHOD_EXPLANATIONS).map((m) => (
            <div key={m.title} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <m.icon className="size-4.5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {m.title}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    {m.title === "Pay with Azul" ? (
                      <Zap className="size-3" aria-hidden />
                    ) : (
                      <Clock className="size-3" aria-hidden />
                    )}
                    {m.speed}
                  </p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {m.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60"
                      aria-hidden
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" aria-hidden />
            Ambos métodos son seguros; la diferencia está en qué tan rápido se
            confirma tu pedido.
          </p>
        </div>

        <div className="border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [showInfo, setShowInfo] = useState(false);

  const select = (method: PaymentMethodOption) => {
    if (onChange) onChange(method.code);
    if (!controlled) setInternal(method.id);
  };

  return (
    <div className="space-y-2.5">
      <div
        role="radiogroup"
        aria-label="Método de pago"
        className="space-y-2.5"
      >
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
                {active && (
                  <span className="size-2.5 rounded-full bg-primary" />
                )}
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

      <button
        type="button"
        onClick={() => setShowInfo(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
      >
        <Info className="size-3.5" aria-hidden />
        Conocer más sobre los métodos de pago
      </button>

      {showInfo ? (
        <PaymentMethodInfoModal onClose={() => setShowInfo(false)} />
      ) : null}
    </div>
  );
}
