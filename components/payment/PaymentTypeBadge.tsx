import { CreditCard, Link2 } from "lucide-react";
import { paymentTypeMeta } from "@/lib/payments/status";

/**
 * Indicador del tipo de pago de un pedido/solicitud: Payment Link o Pago con
 * Azul. Color e icono según el tipo; texto desde `PAYMENT_TYPE_META`.
 */
export function PaymentTypeBadge({
  type,
  className = "",
}: {
  type: string | null | undefined;
  className?: string;
}) {
  const meta = paymentTypeMeta(type);
  const isAzul = meta.methodCode === "azul";
  const Icon = isAzul ? CreditCard : Link2;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${
        isAzul
          ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
          : "border-primary/30 bg-primary/10 text-primary"
      } ${className}`.trim()}
    >
      <Icon className="size-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}
