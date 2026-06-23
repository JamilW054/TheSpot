import type { BadgeVariant } from "@/components/ui/badge";

/**
 * Estados de una solicitud de pago (enlace de pago). Coincide con el enum
 * `payment_request_status` de la base de datos. Metadatos compartidos por el
 * panel admin y el portal del cliente: etiqueta, color de badge, paso del
 * timeline y descripción. Mantener sincronizado con la migración 00016.
 */
export type PaymentStatus =
  | "pending"
  | "link_sent"
  | "in_process"
  | "paid"
  | "expired"
  | "cancelled";

/**
 * Estados gestionables manualmente en el panel admin y filtrables en el cliente.
 * `expired` queda fuera del flujo activo (los enlaces ya no vencen, ver migración
 * 00017/eliminación de expiración) pero conserva metadatos para filas heredadas.
 */
export const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "link_sent",
  "in_process",
  "paid",
  "cancelled",
];

export interface PaymentStatusMeta {
  /** Etiqueta legible (ES). */
  label: string;
  /** Variante del componente Badge. */
  badge: BadgeVariant;
  /** Clase de color del punto/acento en cards y timeline. */
  dot: string;
  /** Posición en la línea de progreso feliz (pending → paid). -1 = fuera de flujo. */
  step: number;
  /** Descripción corta para el cliente. */
  description: string;
}

export const PAYMENT_STATUS_META: Record<PaymentStatus, PaymentStatusMeta> = {
  pending: {
    label: "Pendiente",
    badge: "default",
    dot: "bg-muted-foreground",
    step: 0,
    description: "Tu solicitud de pago se está preparando.",
  },
  link_sent: {
    label: "Enlace enviado",
    badge: "default",
    dot: "bg-primary",
    step: 1,
    description: "Te enviamos un enlace para completar el pago.",
  },
  in_process: {
    label: "En proceso",
    badge: "warning",
    dot: "bg-amber-500",
    step: 2,
    description: "Estamos verificando tu pago.",
  },
  paid: {
    label: "Pagado",
    badge: "success",
    dot: "bg-emerald-500",
    step: 3,
    description: "¡Pago confirmado! Gracias por tu compra.",
  },
  expired: {
    label: "Expirado",
    badge: "destructive",
    dot: "bg-destructive",
    step: -1,
    description: "El enlace de pago ha vencido. Solicita uno nuevo.",
  },
  cancelled: {
    label: "Cancelado",
    badge: "destructive",
    dot: "bg-destructive",
    step: -1,
    description: "Esta solicitud de pago fue cancelada.",
  },
};

/** Pasos del camino feliz que se muestran en el timeline. */
export const PAYMENT_TIMELINE_STEPS: PaymentStatus[] = [
  "pending",
  "link_sent",
  "in_process",
  "paid",
];

export function paymentStatusMeta(status: string): PaymentStatusMeta {
  return (
    PAYMENT_STATUS_META[status as PaymentStatus] ?? PAYMENT_STATUS_META.pending
  );
}

export function isTerminalStatus(status: string): boolean {
  return status === "paid" || status === "cancelled" || status === "expired";
}

/** Método de pago (código en BD `payment_methods.code`). */
export type PaymentMethodCode = "payment_link" | "azul";

/**
 * Tipo de pago de un pedido (`orders.payment_type`). Fuente única de verdad
 * compartida por checkout, panel admin y Centro de pagos del cliente.
 */
export const PAYMENT_TYPE = {
  /** Enlace de pago manual (gestionado desde /admin/pagos). */
  PAYMENT_LINK: "PAYMENT_LINK",
  /** Pasarela Azul (estado controlado por la API/webhooks de Azul). */
  AZUL_PAYMENT: "AZUL_PAYMENT",
} as const;

export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

export interface PaymentTypeMeta {
  label: string;
  /** Código del método de pago asociado en `payment_methods`. */
  methodCode: PaymentMethodCode;
}

export const PAYMENT_TYPE_META: Record<PaymentType, PaymentTypeMeta> = {
  PAYMENT_LINK: { label: "Payment Link", methodCode: "payment_link" },
  AZUL_PAYMENT: { label: "Pago con Azul", methodCode: "azul" },
};

/** Tipo de pago a partir del código de método (`payment_methods.code`). */
export function paymentTypeFromMethodCode(code: string): PaymentType {
  return code === "azul"
    ? PAYMENT_TYPE.AZUL_PAYMENT
    : PAYMENT_TYPE.PAYMENT_LINK;
}

export function paymentTypeMeta(
  type: string | null | undefined,
): PaymentTypeMeta {
  return (
    PAYMENT_TYPE_META[type as PaymentType] ?? PAYMENT_TYPE_META.PAYMENT_LINK
  );
}
