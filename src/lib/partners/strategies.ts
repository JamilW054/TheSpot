/**
 * Estrategias de cobro de socios — fuente única de verdad del "cuánto se le
 * debe a un tercero este mes".
 *
 * Cada estrategia es un objeto con `computeDueCents`. Añadir una nueva forma de
 * cobrar (escalonada por tramos, por pedido, mínimo garantizado, etc.) es
 * registrar una entrada más en `PAYMENT_STRATEGIES` y un valor más en el CHECK
 * de `partners.payment_type` — sin tocar los llamadores ni rediseñar la BD.
 *
 * Este cálculo está SIEMPRE espejado en la vista SQL
 * `partner_monthly_statements` (migración 00031), que es la que alimenta el
 * dashboard y el histórico. La versión TS existe para previsualizar la deuda de
 * una configuración antes de guardarla y para tests. Si cambias la fórmula aquí,
 * cámbiala también en la vista — es el mismo pacto que ya existe entre
 * `lib/pricing.ts` y `admin_monthly_commissions`.
 *
 * Todos los importes en céntimos DOP. Ninguna deuda puede ser negativa: un mes
 * en pérdidas no genera deuda a favor de la empresa.
 */

export type PartnerPaymentType = "percentage" | "fixed";

/** Magnitud mensual sobre la que un socio de tipo porcentaje cobra. */
export type PercentageBase = "revenue" | "gross_profit" | "net_profit";

/**
 * Bases del mes, medidas ANTES de repartir a socios. Si un socio cobrara sobre
 * "lo que queda tras pagar a los socios", su propia deuda entraría en su propia
 * base y el cálculo sería circular.
 */
export interface MonthlyProfitBases {
  /** Importe procesado por la pasarela en el mes. */
  revenueCents: number;
  /** Ingreso de líneas − coste de mercancía. Puede ser negativo. */
  grossProfitCents: number;
  /** Ganancia bruta − comisión de la pasarela AZUL. Puede ser negativo. */
  netProfitCents: number;
}

/** Configuración mínima de un socio necesaria para calcular su deuda. */
export interface PartnerBillingConfig {
  paymentType: PartnerPaymentType;
  percentageRate: number | null;
  percentageBase: PercentageBase;
  fixedAmountCents: number | null;
}

export interface PaymentStrategy {
  type: PartnerPaymentType;
  label: string;
  /** Deuda devengada del mes, en céntimos. Nunca negativa. */
  computeDueCents(
    partner: PartnerBillingConfig,
    bases: MonthlyProfitBases,
  ): number;
  /** Texto corto para la UI ("12% de la ganancia bruta", "RD$5,000.00 fijos"). */
  describe(partner: PartnerBillingConfig): string;
}

export const PERCENTAGE_BASE_LABEL: Record<PercentageBase, string> = {
  revenue: "del ingreso procesado",
  gross_profit: "de la ganancia bruta",
  net_profit: "de la ganancia neta",
};

/** Selecciona la magnitud del mes sobre la que aplica el porcentaje. */
function baseValueCents(
  base: PercentageBase,
  bases: MonthlyProfitBases,
): number {
  switch (base) {
    case "revenue":
      return bases.revenueCents;
    case "net_profit":
      return bases.netProfitCents;
    default:
      return bases.grossProfitCents;
  }
}

const percentageStrategy: PaymentStrategy = {
  type: "percentage",
  label: "Porcentaje",
  computeDueCents(partner, bases) {
    const rate = partner.percentageRate ?? 0;
    const base = baseValueCents(partner.percentageBase, bases);
    return Math.max(0, Math.round((base * rate) / 100));
  },
  describe(partner) {
    const rate = partner.percentageRate ?? 0;
    return `${rate}% ${PERCENTAGE_BASE_LABEL[partner.percentageBase]}`;
  },
};

const fixedStrategy: PaymentStrategy = {
  type: "fixed",
  label: "Monto fijo",
  computeDueCents(partner) {
    return Math.max(0, Math.round(partner.fixedAmountCents ?? 0));
  },
  describe(partner) {
    const cents = partner.fixedAmountCents ?? 0;
    return `${(cents / 100).toLocaleString("es-DO", {
      style: "currency",
      currency: "DOP",
    })} fijos al mes`;
  },
};

export const PAYMENT_STRATEGIES: Record<PartnerPaymentType, PaymentStrategy> = {
  percentage: percentageStrategy,
  fixed: fixedStrategy,
};

/** Deuda devengada del mes para un socio. Punto de entrada único. */
export function computePartnerDueCents(
  partner: PartnerBillingConfig,
  bases: MonthlyProfitBases,
): number {
  return PAYMENT_STRATEGIES[partner.paymentType].computeDueCents(
    partner,
    bases,
  );
}

/** Descripción legible de cómo cobra un socio. */
export function describePartnerBilling(partner: PartnerBillingConfig): string {
  return PAYMENT_STRATEGIES[partner.paymentType].describe(partner);
}

// ---------------------------------------------------------------------------
// Estado de la liquidación del mes
// ---------------------------------------------------------------------------

export type PartnerPaymentStatus =
  | "no_due"
  | "pending"
  | "partial"
  | "paid"
  | "overpaid";

export const PARTNER_STATUS_LABEL: Record<PartnerPaymentStatus, string> = {
  no_due: "Sin deuda",
  pending: "Pendiente",
  partial: "Pago parcial",
  paid: "Pagado",
  overpaid: "Sobrepagado",
};

/** Tono del badge en el admin (ver components/admin/ui `AdminBadgeTone`). */
export const PARTNER_STATUS_TONE: Record<
  PartnerPaymentStatus,
  "neutral" | "warning" | "success" | "danger"
> = {
  no_due: "neutral",
  pending: "warning",
  partial: "warning",
  paid: "success",
  overpaid: "danger",
};

/**
 * Estado de un mes a partir de deuda y pagado. Espejo del `CASE` de la vista
 * `partner_monthly_statements`.
 */
export function derivePartnerStatus(
  dueCents: number,
  paidCents: number,
): PartnerPaymentStatus {
  if (dueCents <= 0 && paidCents === 0) return "no_due";
  if (paidCents <= 0) return "pending";
  if (paidCents > dueCents) return "overpaid";
  if (paidCents === dueCents) return "paid";
  return "partial";
}
