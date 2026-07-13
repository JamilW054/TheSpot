/**
 * Módulo de socios / terceros: dominio puro (estrategias de cobro, estado de
 * liquidación, DTOs y validación). Sin acceso a datos ni a React — lo consumen
 * las server actions (`lib/actions/partners-admin.ts`), los repositorios
 * (`database/repositories/partners.ts`) y la UI del admin.
 */

export {
  assertPaymentWithinBalance,
  currentMonthStart,
  PAYMENT_TYPES,
  type PartnerInput,
  type PartnerPaymentInput,
  type PaymentBalanceLimits,
  PERCENTAGE_BASES,
  toMonthStart,
  validatePartnerInput,
  validatePartnerPaymentInput,
} from "./dto";
export { generatePaymentReference } from "./reference";
export {
  computePartnerDueCents,
  derivePartnerStatus,
  describePartnerBilling,
  type MonthlyProfitBases,
  PARTNER_STATUS_LABEL,
  PARTNER_STATUS_TONE,
  PAYMENT_STRATEGIES,
  type PartnerBillingConfig,
  type PartnerPaymentStatus,
  type PartnerPaymentType,
  type PaymentStrategy,
  PERCENTAGE_BASE_LABEL,
  type PercentageBase,
} from "./strategies";
