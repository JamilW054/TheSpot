/**
 * Acceso a datos del módulo de socios / terceros.
 *
 * - `partnersRepo` / `partnerPaymentsRepo`: CRUD sobre las tablas, con el
 *   `Repository` genérico del proyecto (service role, bypass RLS — igual que el
 *   resto del panel admin).
 * - Las lecturas derivadas (deuda, pagado, balance, estado, histórico) NO se
 *   calculan aquí: vienen ya resueltas de la vista `partner_monthly_statements`
 *   (migración 00031). Este archivo solo la consulta y mapea filas a tipos de
 *   dominio. Ver `lib/partners/strategies.ts` para la fórmula.
 *
 * Nota sobre `partner_payments`: un trigger en BD prohíbe el DELETE físico y
 * cualquier edición del contenido de un pago. Lo único que admite es la
 * anulación (`voided_at`), que es lo que hace `remove(id)`. Por eso no hay un
 * `updatePayment` que ofrecer: fallaría igualmente.
 */

import { currentMonthStart } from "@/lib/partners/dto";
import type {
  PartnerPaymentStatus,
  PartnerPaymentType,
  PercentageBase,
} from "@/lib/partners/strategies";
import { createServiceClient } from "@/lib/supabase/server";
import { Repository } from "./repository";

// ---------------------------------------------------------------------------
// Tipos de fila
// ---------------------------------------------------------------------------

export interface PartnerRow {
  id: string;
  name: string;
  legal_name: string | null;
  payment_type: PartnerPaymentType;
  percentage_rate: number | null;
  percentage_base: PercentageBase;
  fixed_amount_cents: number | null;
  frequency: string;
  currency: string;
  starts_on: string | null;
  ends_on: string | null;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerPaymentRow {
  id: string;
  partner_id: string;
  period_month: string;
  amount_cents: number;
  payment_date: string;
  reference: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  /** Si no es null, el pago está anulado: no cuenta ni se lista. */
  voided_at: string | null;
  voided_by: string | null;
  voided_reason: string | null;
}

/** Fila de la vista `partner_monthly_statements`. */
interface PartnerStatementDbRow {
  partner_id: string;
  partner_name: string;
  payment_type: PartnerPaymentType;
  percentage_rate: number | null;
  percentage_base: PercentageBase;
  fixed_amount_cents: number | null;
  active: boolean;
  month: string;
  base_revenue_cents: number;
  base_gross_profit_cents: number;
  base_net_profit_cents: number;
  due_cents: number;
  paid_cents: number;
  balance_cents: number;
  last_payment_date: string | null;
  payments_count: number;
  status: PartnerPaymentStatus;
}

/** Estado de cuenta de un socio en un mes concreto (ya calculado en la vista). */
export interface PartnerMonthlyStatement {
  partnerId: string;
  partnerName: string;
  paymentType: PartnerPaymentType;
  percentageRate: number | null;
  percentageBase: PercentageBase;
  fixedAmountCents: number | null;
  active: boolean;
  /** Primer día del mes (`YYYY-MM-01`). */
  month: string;
  /** Bases del mes, antes del reparto a socios. */
  baseRevenueCents: number;
  baseGrossProfitCents: number;
  baseNetProfitCents: number;
  /** Deuda devengada del mes. Nunca negativa. */
  dueCents: number;
  /** Suma de pagos imputados al mes (los reversos restan). */
  paidCents: number;
  /** dueCents − paidCents. Negativo = sobrepagado. */
  balanceCents: number;
  lastPaymentDate: string | null;
  paymentsCount: number;
  status: PartnerPaymentStatus;
}

const PARTNER_COLS =
  "id, name, legal_name, payment_type, percentage_rate, percentage_base, fixed_amount_cents, frequency, currency, starts_on, ends_on, active, notes, created_at, updated_at";

const PARTNER_PAYMENT_COLS =
  "id, partner_id, period_month, amount_cents, payment_date, reference, notes, created_by, created_at, voided_at, voided_by, voided_reason";

// ---------------------------------------------------------------------------
// Repositorios
// ---------------------------------------------------------------------------

export const partnersRepo = new Repository<PartnerRow>({
  table: "partners",
  columns: PARTNER_COLS,
  hasSoftDelete: true,
  defaultOrderBy: { column: "name" },
});

/**
 * `hasSoftDelete` con columna `voided_at`: así `remove(id)` anula el pago en vez
 * de intentar borrarlo (el trigger de BD rechazaría el DELETE físico).
 */
export const partnerPaymentsRepo = new Repository<PartnerPaymentRow>({
  table: "partner_payments",
  hasSoftDelete: true,
  softDeleteColumn: "voided_at",
  columns: PARTNER_PAYMENT_COLS,
  defaultOrderBy: { column: "payment_date", ascending: false },
});

// ---------------------------------------------------------------------------
// Lecturas derivadas (vista)
// ---------------------------------------------------------------------------

function toStatement(row: PartnerStatementDbRow): PartnerMonthlyStatement {
  return {
    partnerId: row.partner_id,
    partnerName: row.partner_name,
    paymentType: row.payment_type,
    percentageRate:
      row.percentage_rate == null ? null : Number(row.percentage_rate),
    percentageBase: row.percentage_base,
    fixedAmountCents:
      row.fixed_amount_cents == null ? null : Number(row.fixed_amount_cents),
    active: row.active,
    month: row.month,
    baseRevenueCents: Number(row.base_revenue_cents),
    baseGrossProfitCents: Number(row.base_gross_profit_cents),
    baseNetProfitCents: Number(row.base_net_profit_cents),
    dueCents: Number(row.due_cents),
    paidCents: Number(row.paid_cents),
    balanceCents: Number(row.balance_cents),
    lastPaymentDate: row.last_payment_date,
    paymentsCount: Number(row.payments_count),
    status: row.status,
  };
}

/**
 * Estado de cuenta del mes en curso de cada socio activo — lo que pinta el
 * dashboard. Se recalcula en cada lectura, así que refleja al instante un pago
 * recién registrado, un cambio de ganancia o un cambio de configuración del
 * socio; no hay nada cacheado que invalidar.
 *
 * Nunca tumba el dashboard: si la consulta falla (p. ej. migraciones 00030/00031
 * aún sin aplicar) devuelve lista vacía y deja rastro en el log — un fallo mudo
 * disfrazado de "no hay socios" es indiagnosticable.
 */
export async function getActivePartnersCurrentStatement(): Promise<
  PartnerMonthlyStatement[]
> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("partner_monthly_statements")
      .select("*")
      .eq("month", currentMonthStart())
      .eq("active", true)
      .order("partner_name", { ascending: true });
    if (error) throw error;
    return ((data ?? []) as unknown as PartnerStatementDbRow[]).map(
      toStatement,
    );
  } catch (error) {
    console.error(
      "[partners] Error leyendo el estado de cuenta del mes en curso",
      error,
    );
    return [];
  }
}

/** Estado de cuenta de un socio en un mes (por defecto, el mes en curso). */
export async function getPartnerStatementForMonth(
  partnerId: string,
  month: string = currentMonthStart(),
): Promise<PartnerMonthlyStatement | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("partner_monthly_statements")
    .select("*")
    .eq("partner_id", partnerId)
    .eq("month", month)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toStatement(data as unknown as PartnerStatementDbRow) : null;
}

/**
 * Histórico mensual completo de un socio, del mes más reciente al más antiguo.
 * Es la fuente del bloque "Historial" y de los futuros gráficos: al derivarse de
 * la vista, ningún mes cerrado puede "perderse" ni reescribirse por error.
 */
export async function getPartnerMonthlyHistory(
  partnerId: string,
  limit = 24,
): Promise<PartnerMonthlyStatement[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("partner_monthly_statements")
    .select("*")
    .eq("partner_id", partnerId)
    .order("month", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as PartnerStatementDbRow[]).map(toStatement);
}

/** Pago + nombre del admin que lo registró (traza de auditoría). */
export interface PartnerPaymentWithAuthor extends PartnerPaymentRow {
  authorName: string | null;
}

/**
 * Pagos vigentes de un socio, del más reciente al más antiguo, con el autor
 * resuelto. Los anulados quedan fuera: siguen en la BD para auditoría, pero no
 * se listan ni cuentan. `created_by` puede quedar en NULL si el admin que lo
 * registró se dio de baja (FK `ON DELETE SET NULL`): el pago sobrevive al
 * usuario, que es lo correcto para un libro contable.
 */
export async function getPartnerPayments(
  partnerId: string,
  limit = 100,
): Promise<PartnerPaymentWithAuthor[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("partner_payments")
    .select(
      `${PARTNER_PAYMENT_COLS}, profiles!partner_payments_created_by_fkey(full_name)`,
    )
    .eq("partner_id", partnerId)
    .is("voided_at", null)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  type Row = PartnerPaymentRow & {
    profiles:
      | { full_name: string | null }
      | { full_name: string | null }[]
      | null;
  };
  return ((data ?? []) as unknown as Row[]).map(({ profiles, ...payment }) => {
    const author = Array.isArray(profiles) ? profiles[0] : profiles;
    return { ...payment, authorName: author?.full_name ?? null };
  });
}
