"use server";

import { revalidatePath } from "next/cache";
import {
  type BankAccountInput,
  createBankAccount,
  deleteBankAccount,
  type PaymentSettings,
  setFreeShippingMinCents,
  setPaymentSettings,
  updateBankAccount,
} from "@/database/repositories/payments";
import { assertRowAccess, requireOwnStore, requireStoreActor } from "@/lib/auth/store-actor";

export type PaymentActionResult = { ok: true } | { ok: false; error: string };

function fail(e: unknown): PaymentActionResult {
  return { ok: false, error: e instanceof Error ? e.message : "Error inesperado." };
}

function revalidateStore() {
  revalidatePath("/panel/pagos");
  revalidatePath("/panel/tienda");
  revalidatePath("/carrito", "layout");
  revalidatePath("/", "layout");
}

function clean(v: unknown, max = 200): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function parseBank(input: Record<string, unknown>): BankAccountInput {
  const bankName = clean(input.bankName, 80);
  const accountNumber = clean(input.accountNumber, 40);
  const holderName = clean(input.holderName, 120);
  const isActive = input.isActive === true;
  if (!bankName) throw new Error("Indica el nombre del banco.");
  if (isActive && (!accountNumber || !holderName)) {
    throw new Error(
      "Para activar la cuenta completa el número de cuenta y el titular.",
    );
  }
  if (accountNumber && !/^[0-9\- ]{4,40}$/.test(accountNumber)) {
    throw new Error("El número de cuenta solo puede tener dígitos y guiones.");
  }
  const sort = Number(input.sortOrder);
  return {
    bankName,
    accountType: clean(input.accountType, 40) || "Ahorros",
    accountNumber,
    holderName,
    holderDocument: clean(input.holderDocument, 40) || null,
    currency: clean(input.currency, 3).toUpperCase() || "DOP",
    instructions: clean(input.instructions, 400) || null,
    isActive,
    sortOrder: Number.isFinite(sort) ? Math.trunc(sort) : 0,
  };
}

export async function adminSaveBankAccount(
  id: string | null,
  input: Record<string, unknown>,
): Promise<PaymentActionResult> {
  try {
    const data = parseBank(input);
    if (id) {
      const actor = await requireStoreActor();
      await assertRowAccess(actor, "bank_accounts", id);
      await updateBankAccount(id, data);
    } else {
      const actor = await requireOwnStore();
      await createBankAccount(actor.store.id, data);
    }
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function adminDeleteBankAccount(id: string): Promise<PaymentActionResult> {
  try {
    const actor = await requireStoreActor();
    await assertRowAccess(actor, "bank_accounts", id);
    await deleteBankAccount(id);
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function adminSavePaymentSettings(
  s: PaymentSettings,
): Promise<PaymentActionResult> {
  try {
    const actor = await requireOwnStore();
    if (!s.cashOnDelivery && !s.bankTransfer) {
      throw new Error("Deja al menos un método de pago activo.");
    }
    await setPaymentSettings(actor.store.id, {
      cashOnDelivery: s.cashOnDelivery === true,
      bankTransfer: s.bankTransfer === true,
      cashOnDeliveryNote: clean(s.cashOnDeliveryNote, 300),
      bankTransferNote: clean(s.bankTransferNote, 300),
    });
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Umbral de envío gratis en pesos (0 = desactivado). */
export async function adminSaveFreeShipping(
  pesos: number,
): Promise<PaymentActionResult> {
  try {
    const actor = await requireOwnStore();
    if (!Number.isFinite(pesos) || pesos < 0 || pesos > 10_000_000) {
      throw new Error("Monto no válido.");
    }
    await setFreeShippingMinCents(actor.store.id, Math.round(pesos * 100));
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
