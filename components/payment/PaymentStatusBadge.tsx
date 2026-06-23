import { Badge } from "@/components/ui/badge";
import { paymentStatusMeta } from "@/lib/payments/status";

/** Badge de estado de pago con color e icono según el estado. */
export function PaymentStatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const meta = paymentStatusMeta(status);
  return (
    <Badge variant={meta.badge} className={className}>
      <span
        className={`mr-1.5 size-1.5 rounded-full ${meta.dot}`}
        aria-hidden
      />
      {meta.label}
    </Badge>
  );
}
