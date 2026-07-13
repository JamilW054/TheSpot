/**
 * DTOs y validación del módulo de socios.
 *
 * La UI manda `FormData`; las server actions lo traducen a estos DTOs y los
 * validan ANTES de tocar el repositorio. Así la regla de negocio ("un socio de
 * tipo porcentaje necesita tasa", "un pago no puede ser de cero") vive en una
 * sola capa, no repartida entre el formulario, la action y los CHECK de la BD
 * — la BD es la última línea de defensa, no la primera.
 *
 * `validate*` devuelve el DTO normalizado o lanza `Error` con un mensaje apto
 * para el usuario, que es lo que las actions ya convierten en `CrudState.error`.
 */

import type {
  PartnerPaymentType,
  PercentageBase,
} from "@/lib/partners/strategies";

export const PAYMENT_TYPES: PartnerPaymentType[] = ["percentage", "fixed"];
export const PERCENTAGE_BASES: PercentageBase[] = [
  "revenue",
  "gross_profit",
  "net_profit",
];

export interface PartnerInput {
  name: string;
  legalName: string | null;
  paymentType: PartnerPaymentType;
  percentageRate: number | null;
  percentageBase: PercentageBase;
  fixedAmountCents: number | null;
  startsOn: string | null;
  endsOn: string | null;
  active: boolean;
  notes: string | null;
}

export interface PartnerPaymentInput {
  partnerId: string;
  /** Mes al que se imputa el pago, normalizado al día 1 (YYYY-MM-01). */
  periodMonth: string;
  amountCents: number;
  paymentDate: string;
  reference: string | null;
  notes: string | null;
}

function isPaymentType(v: string): v is PartnerPaymentType {
  return (PAYMENT_TYPES as string[]).includes(v);
}

function isPercentageBase(v: string): v is PercentageBase {
  return (PERCENTAGE_BASES as string[]).includes(v);
}

/** `YYYY-MM` o `YYYY-MM-DD` → primer día del mes (`YYYY-MM-01`). */
export function toMonthStart(value: string): string | null {
  const m = value.trim().match(/^(\d{4})-(\d{2})/);
  if (!m) return null;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return `${m[1]}-${m[2]}-01`;
}

/** Mes en curso (`YYYY-MM-01`) en hora dominicana, igual que la vista SQL. */
export function currentMonthStart(reference: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santo_Domingo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(reference);
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${year}-${month}-01`;
}

function isIsoDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  );
}

/**
 * Valida la configuración de un socio. El invariante clave es que cada
 * estrategia trae su propio campo obligatorio: sin él, el socio devengaría 0 en
 * silencio mes tras mes y nadie se enteraría hasta la auditoría.
 */
export function validatePartnerInput(input: PartnerInput): PartnerInput {
  const name = input.name.trim();
  if (!name) throw new Error("El nombre del socio es obligatorio.");
  if (name.length > 120)
    throw new Error("El nombre no puede superar los 120 caracteres.");

  if (!isPaymentType(input.paymentType))
    throw new Error("Tipo de pago inválido.");
  if (!isPercentageBase(input.percentageBase))
    throw new Error("Base de cálculo inválida.");

  let percentageRate = input.percentageRate;
  let fixedAmountCents = input.fixedAmountCents;

  if (input.paymentType === "percentage") {
    if (percentageRate == null || !Number.isFinite(percentageRate))
      throw new Error("Indica el porcentaje que cobra el socio.");
    if (percentageRate < 0 || percentageRate > 100)
      throw new Error("El porcentaje debe estar entre 0 y 100.");
    // El campo de la otra estrategia se limpia: dejarlo poblado invita a leerlo
    // por error si mañana se cambia de estrategia.
    fixedAmountCents = null;
  } else {
    if (fixedAmountCents == null || !Number.isFinite(fixedAmountCents))
      throw new Error("Indica el monto fijo que cobra el socio.");
    if (fixedAmountCents < 0)
      throw new Error("El monto fijo no puede ser negativo.");
    percentageRate = null;
  }

  const startsOn = input.startsOn?.trim() || null;
  const endsOn = input.endsOn?.trim() || null;
  if (startsOn && !isIsoDate(startsOn))
    throw new Error("Fecha de inicio inválida.");
  if (endsOn && !isIsoDate(endsOn)) throw new Error("Fecha de fin inválida.");
  if (startsOn && endsOn && endsOn < startsOn)
    throw new Error("La fecha de fin no puede ser anterior a la de inicio.");

  return {
    name,
    legalName: input.legalName?.trim() || null,
    paymentType: input.paymentType,
    percentageRate,
    percentageBase: input.percentageBase,
    fixedAmountCents,
    startsOn,
    endsOn,
    active: input.active,
    notes: input.notes?.trim() || null,
  };
}

/** Cifras del mes contra las que se contrasta un pago nuevo. */
export interface PaymentBalanceLimits {
  /** Deuda devengada del mes. */
  dueCents: number;
  /** Ya pagado en ese mes (los reversos previos ya restan). */
  paidCents: number;
  /** dueCents − paidCents: lo máximo que se puede pagar ahora. */
  balanceCents: number;
}

/** Céntimos → "RD$1,234.56", para los mensajes de error. */
function dop(cents: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(cents / 100);
}

/**
 * Un pago no puede exceder lo que realmente se debe.
 *
 * Esta regla necesita el estado del mes (deuda y pagos previos), así que no
 * puede vivir en `validatePartnerPaymentInput`, que es puramente sintáctica: la
 * llama la server action después de leer el estado de cuenta. Comprobarlo en el
 * cliente no basta — el límite se aplica en el servidor, contra las cifras
 * frescas, o dos pestañas abiertas podrían sobrepagar a la vez.
 *
 * Los reversos (importe negativo) tienen su propio tope: no se puede revertir
 * más de lo que se ha pagado, o el mes quedaría con un "pagado" negativo, que no
 * significa nada.
 */
export function assertPaymentWithinBalance(
  amountCents: number,
  limits: PaymentBalanceLimits,
): void {
  if (amountCents > 0) {
    if (limits.balanceCents <= 0) {
      throw new Error(
        limits.dueCents <= 0
          ? "Este mes no ha devengado ninguna deuda: no hay nada que pagar."
          : `La deuda de este mes ya está saldada (${dop(limits.paidCents)} de ${dop(limits.dueCents)}).`,
      );
    }
    if (amountCents > limits.balanceCents) {
      throw new Error(
        `El importe supera lo que se debe. Pendiente: ${dop(limits.balanceCents)}.`,
      );
    }
    return;
  }

  // Reverso.
  if (limits.paidCents <= 0) {
    throw new Error("No hay pagos que revertir en este mes.");
  }
  if (Math.abs(amountCents) > limits.paidCents) {
    throw new Error(
      `No puedes revertir más de lo pagado en el mes (${dop(limits.paidCents)}).`,
    );
  }
}

/**
 * Valida un pago. Se permite importe negativo (reverso de un pago mal
 * registrado): la tabla es append-only, así que corregir es compensar, no
 * editar. Cero se rechaza — no aporta información y ensucia el histórico.
 *
 * El tope contra el balance real NO se comprueba aquí (hace falta ir a la BD):
 * ver `assertPaymentWithinBalance`.
 */
export function validatePartnerPaymentInput(
  input: PartnerPaymentInput,
): PartnerPaymentInput {
  const partnerId = input.partnerId.trim();
  if (!partnerId) throw new Error("Falta el socio del pago.");

  if (!Number.isFinite(input.amountCents) || input.amountCents === 0)
    throw new Error("El importe del pago debe ser distinto de cero.");

  const paymentDate = input.paymentDate.trim();
  if (!isIsoDate(paymentDate)) throw new Error("Fecha de pago inválida.");

  const periodMonth = toMonthStart(input.periodMonth);
  if (!periodMonth) throw new Error("Mes de imputación inválido.");

  return {
    partnerId,
    periodMonth,
    amountCents: Math.round(input.amountCents),
    paymentDate,
    reference: input.reference?.trim() || null,
    notes: input.notes?.trim() || null,
  };
}
