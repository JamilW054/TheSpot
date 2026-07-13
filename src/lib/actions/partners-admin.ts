"use server";

/**
 * Server actions del módulo de socios / terceros.
 *
 * Capa de aplicación: autentica (`requireAdmin`), traduce `FormData` a DTOs,
 * delega la validación al dominio (`lib/partners/dto.ts`), llama al repositorio
 * y revalida las rutas afectadas. Ninguna regla de negocio vive aquí — si
 * aparece un `if` que decide *cuánto* se le debe a alguien, va a
 * `lib/partners/strategies.ts`, no a este archivo.
 */

import { revalidatePath } from "next/cache";
import {
  getPartnerStatementForMonth,
  partnerPaymentsRepo,
  partnersRepo,
} from "@/database/repositories/partners";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  assertPaymentWithinBalance,
  currentMonthStart,
  generatePaymentReference,
  type PartnerInput,
  type PartnerPaymentInput,
  validatePartnerInput,
  validatePartnerPaymentInput,
} from "@/lib/partners";
import type {
  PartnerPaymentType,
  PercentageBase,
} from "@/lib/partners/strategies";

export type CrudState = { ok?: true; error?: string };

// ---------------------------------------------------------------------------
// Helpers de parseo de FormData
// ---------------------------------------------------------------------------

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key)?.toString().trim();
  return v && v.length > 0 ? v : null;
}

function requiredStr(fd: FormData, key: string, label: string): string {
  const v = str(fd, key);
  if (!v) throw new Error(`${label} es obligatorio.`);
  return v;
}

function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on" || fd.get(key) === "true";
}

function decimalOrNull(fd: FormData, key: string): number | null {
  const raw = str(fd, key);
  if (!raw) return null;
  const n = Number.parseFloat(raw.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/**
 * Importe DOP → céntimos, con signo. A diferencia de `moneyToCents` de
 * `admin-crud.ts`, aquí un negativo es válido: es como se registra el reverso de
 * un pago mal introducido en un libro append-only.
 */
function signedMoneyToCents(fd: FormData, key: string): number | null {
  const n = decimalOrNull(fd, key);
  return n == null ? null : Math.round(n * 100);
}

function ok(): CrudState {
  return { ok: true };
}
function fail(e: unknown): CrudState {
  return { error: e instanceof Error ? e.message : "Error inesperado." };
}

/**
 * El dashboard y el detalle del socio leen de la vista en cada request, así que
 * basta con invalidar el caché de rutas: no hay total materializado que
 * recomputar. Cualquier cambio (alta de pago, nueva configuración, nuevo socio)
 * se refleja en la siguiente lectura.
 */
function revalidatePartners(partnerId?: string): void {
  revalidatePath("/admin");
  revalidatePath("/admin/socios");
  if (partnerId) revalidatePath(`/admin/socios/${partnerId}`);
}

// ---------------------------------------------------------------------------
// Mapeo FormData → DTO
// ---------------------------------------------------------------------------

function partnerInputFromForm(fd: FormData): PartnerInput {
  const paymentType = (str(fd, "payment_type") ??
    "percentage") as PartnerPaymentType;
  return {
    name: requiredStr(fd, "name", "El nombre"),
    legalName: str(fd, "legal_name"),
    paymentType,
    percentageRate: decimalOrNull(fd, "percentage_rate"),
    percentageBase: (str(fd, "percentage_base") ??
      "gross_profit") as PercentageBase,
    fixedAmountCents: signedMoneyToCents(fd, "fixed_amount_dop"),
    startsOn: str(fd, "starts_on"),
    endsOn: str(fd, "ends_on"),
    active: bool(fd, "active"),
    notes: str(fd, "notes"),
  };
}

/** DTO validado → fila de `partners`. */
function partnerRowValues(input: PartnerInput): Record<string, unknown> {
  return {
    name: input.name,
    legal_name: input.legalName,
    payment_type: input.paymentType,
    percentage_rate: input.percentageRate,
    percentage_base: input.percentageBase,
    fixed_amount_cents: input.fixedAmountCents,
    starts_on: input.startsOn,
    ends_on: input.endsOn,
    active: input.active,
    notes: input.notes,
  };
}

function paymentInputFromForm(fd: FormData): PartnerPaymentInput {
  return {
    partnerId: requiredStr(fd, "partner_id", "El socio"),
    // Vacío = el mes en curso, que es el caso normal ("pagar lo de este mes").
    periodMonth: str(fd, "period_month") ?? currentMonthStart(),
    amountCents: signedMoneyToCents(fd, "amount_dop") ?? Number.NaN,
    paymentDate:
      str(fd, "payment_date") ?? new Date().toISOString().slice(0, 10),
    reference: str(fd, "reference"),
    notes: str(fd, "notes"),
  };
}

// ===========================================================================
// SOCIOS (partners)
// ===========================================================================

export async function adminCreatePartner(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const input = validatePartnerInput(partnerInputFromForm(fd));
    const created = await partnersRepo.insert(partnerRowValues(input));
    revalidatePartners(created.id);
    return ok();
  } catch (e) {
    return fail(e);
  }
}

export async function adminUpdatePartner(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    await requireAdmin();
    const id = requiredStr(fd, "partner_id", "El identificador");
    const input = validatePartnerInput(partnerInputFromForm(fd));
    await partnersRepo.updateById(id, partnerRowValues(input));
    revalidatePartners(id);
    return ok();
  } catch (e) {
    return fail(e);
  }
}

/**
 * Baja de un socio: borrado lógico (`deleted_at`). Nunca físico — los pagos ya
 * registrados apuntan a esta fila y su histórico debe seguir siendo legible.
 * La FK es `ON DELETE RESTRICT` precisamente para que un borrado físico
 * accidental falle en vez de llevarse la contabilidad por delante.
 */
export async function adminDeletePartner(id: string): Promise<void> {
  await requireAdmin();
  await partnersRepo.remove(id);
  revalidatePartners(id);
}

// ===========================================================================
// PAGOS A SOCIOS (partner_payments)
// ===========================================================================

/**
 * Anula un pago (borrado lógico). Deja de contar como pagado y desaparece del
 * historial, pero la fila permanece con quién lo anuló y cuándo: un importe que
 * se evapora sin rastro convierte el libro en algo no auditable.
 *
 * El contenido del pago sigue siendo inmutable — el trigger de BD solo admite
 * esta transición y rechaza cualquier otra edición o el DELETE físico.
 */
export async function adminVoidPartnerPayment(id: string): Promise<void> {
  const admin = await requireAdmin();
  const payment = await partnerPaymentsRepo.findById(id);
  if (!payment) throw new Error("El pago no existe.");
  if (payment.voided_at) throw new Error("Este pago ya estaba anulado.");

  await partnerPaymentsRepo.updateById(id, {
    voided_at: new Date().toISOString(),
    voided_by: admin.userId,
  });

  revalidatePartners(payment.partner_id);
}

/** Violación de unicidad en Postgres (referencia de pago repetida). */
const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(e: unknown): boolean {
  return (e as { code?: string })?.code === UNIQUE_VIOLATION;
}

/** Intentos de generación de referencia antes de rendirse (colisión: ~1 entre 729M). */
const REFERENCE_ATTEMPTS = 5;

/**
 * Registra un pago. Es un único INSERT — atómico por definición, sin necesidad
 * de transacción explícita: no hay total que actualizar en otra tabla porque
 * deuda, pagado y balance se derivan de la vista. Ese es justamente el motivo
 * de no materializar los cálculos.
 *
 * Dos reglas se aplican aquí, en el servidor, y no en el formulario:
 *
 * 1. El importe no puede superar el balance pendiente del mes. Se contrasta
 *    contra el estado de cuenta leído en este mismo instante: validarlo solo en
 *    el cliente dejaría pasar un sobrepago desde dos pestañas abiertas a la vez,
 *    o desde un formulario con datos rancios.
 * 2. Si el admin no aporta referencia, se genera una única y buscable. Si la
 *    aporta y ya existe, el índice único la rechaza y se avisa en claro.
 *
 * La tabla es append-only (trigger en BD): esta acción solo inserta. Para
 * corregir un pago mal registrado se introduce otro con importe negativo.
 */
export async function adminRegisterPartnerPayment(
  _prev: CrudState | undefined,
  fd: FormData,
): Promise<CrudState> {
  try {
    const admin = await requireAdmin();
    const input = validatePartnerPaymentInput(paymentInputFromForm(fd));

    const partner = await partnersRepo.findById(input.partnerId);
    if (!partner) throw new Error("El socio no existe.");

    // Cifras frescas del mes que se está liquidando (no las que vio el formulario).
    const statement = await getPartnerStatementForMonth(
      input.partnerId,
      input.periodMonth,
    );
    assertPaymentWithinBalance(input.amountCents, {
      dueCents: statement?.dueCents ?? 0,
      paidCents: statement?.paidCents ?? 0,
      balanceCents: statement?.balanceCents ?? 0,
    });

    const values = {
      partner_id: input.partnerId,
      period_month: input.periodMonth,
      amount_cents: input.amountCents,
      payment_date: input.paymentDate,
      notes: input.notes,
      created_by: admin.userId,
    };

    if (input.reference) {
      // Referencia del admin: si choca, el problema es suyo y hay que decírselo.
      try {
        await partnerPaymentsRepo.insert({
          ...values,
          reference: input.reference,
        });
      } catch (e) {
        if (isUniqueViolation(e)) {
          throw new Error(
            `Ya existe un pago con la referencia "${input.reference}".`,
          );
        }
        throw e;
      }
    } else {
      // Referencia automática: una colisión es cosa nuestra, no del usuario —
      // se reintenta en silencio en vez de hacerle reescribir el formulario.
      let inserted = false;
      for (
        let attempt = 0;
        attempt < REFERENCE_ATTEMPTS && !inserted;
        attempt++
      ) {
        try {
          await partnerPaymentsRepo.insert({
            ...values,
            reference: generatePaymentReference(input.periodMonth),
          });
          inserted = true;
        } catch (e) {
          if (!isUniqueViolation(e)) throw e;
        }
      }
      if (!inserted) {
        throw new Error(
          "No se pudo generar una referencia única para el pago. Inténtalo de nuevo.",
        );
      }
    }

    revalidatePartners(input.partnerId);
    return ok();
  } catch (e) {
    return fail(e);
  }
}
