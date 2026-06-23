import { Check } from "lucide-react";
import { formatDateTime } from "@/lib/format-date";
import {
  isTerminalStatus,
  PAYMENT_TIMELINE_STEPS,
  type PaymentStatus,
  paymentStatusMeta,
} from "@/lib/payments/status";

export interface TimelineEvent {
  newStatus: PaymentStatus;
  note: string | null;
  createdAt: string;
}

/**
 * Línea de tiempo del pago. Muestra el camino feliz (Pendiente → Pagado) con
 * los pasos completados y, si el pago terminó en Expirado/Cancelado, lo añade
 * como paso final destacado. Las fechas vienen del historial real.
 */
export function PaymentTimeline({
  status,
  events,
}: {
  status: PaymentStatus;
  events: TimelineEvent[];
}) {
  const current = paymentStatusMeta(status);
  const reachedStep = current.step;
  const dateFor = (s: PaymentStatus): string | null => {
    const ev = events.find((e) => e.newStatus === s);
    return ev ? ev.createdAt : null;
  };

  const steps = PAYMENT_TIMELINE_STEPS.map((s) => {
    const meta = paymentStatusMeta(s);
    const done = reachedStep >= meta.step && reachedStep !== -1;
    const active = reachedStep === meta.step;
    return { status: s, meta, done, active, date: dateFor(s) };
  });

  const terminal = isTerminalStatus(status) && status !== "paid";

  return (
    <ol className="relative space-y-0">
      {steps.map((step, i) => {
        const last = i === steps.length - 1 && !terminal;
        return (
          <li key={step.status} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && (
              <span
                className={`absolute left-[11px] top-6 h-full w-px ${
                  step.done ? "bg-primary/50" : "bg-border"
                }`}
                aria-hidden
              />
            )}
            <span
              className={`relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                step.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : step.active
                    ? "border-primary bg-background text-primary"
                    : "border-border bg-background text-muted-foreground"
              }`}
            >
              {step.done ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <span
                  className="size-1.5 rounded-full bg-current"
                  aria-hidden
                />
              )}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={`text-sm font-medium ${
                  step.done || step.active
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.meta.label}
              </p>
              {step.date ? (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatDateTime(step.date)}
                </p>
              ) : (
                <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                  {step.meta.description}
                </p>
              )}
            </div>
          </li>
        );
      })}

      {terminal && (
        <li className="relative flex gap-3">
          <span className="relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive/10 text-destructive">
            <span className="size-1.5 rounded-full bg-current" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-destructive">
              {current.label}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {dateFor(status)
                ? formatDateTime(dateFor(status))
                : current.description}
            </p>
          </div>
        </li>
      )}
    </ol>
  );
}
