import { Banknote, Landmark } from "lucide-react";

/**
 * Métodos de pago de la tienda (sin pasarela en línea): contra entrega y
 * transferencia bancaria. Los métodos activos y las cuentas se configuran en
 * /admin/pagos; esto es solo el distintivo visual.
 */
function PaymentBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-[12px] font-medium text-foreground">
      {icon}
      {label}
    </span>
  );
}

export function AcceptedPayments({
  label = "Formas de pago",
  className = "",
  align = "start",
}: {
  label?: string | null;
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <div
      className={`flex flex-col gap-2 ${
        align === "center" ? "items-center" : "items-start"
      } ${className}`}
    >
      {label ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <PaymentBadge
          icon={<Banknote className="size-4 text-primary" aria-hidden />}
          label="Contra entrega"
        />
        <PaymentBadge
          icon={<Landmark className="size-4 text-primary" aria-hidden />}
          label="Transferencia"
        />
      </div>
    </div>
  );
}
