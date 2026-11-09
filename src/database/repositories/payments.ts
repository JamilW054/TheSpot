import { getSetting, setSetting } from "@/database/repositories/settings";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Métodos de pago offline de la tienda (no hay pasarela):
 * - `cash_on_delivery`: el cliente paga al recibir.
 * - `bank_transfer`: el cliente transfiere a una de las cuentas activas.
 * Todo se administra en /admin/pagos.
 */

export const PAYMENT_METHODS = ["cash_on_delivery", "bank_transfer"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash_on_delivery: "Pago contra entrega",
  bank_transfer: "Transferencia bancaria",
};

export function isPaymentMethod(v: unknown): v is PaymentMethod {
  return typeof v === "string" && (PAYMENT_METHODS as readonly string[]).includes(v);
}

export function paymentMethodLabel(v: string | null | undefined): string {
  return isPaymentMethod(v) ? PAYMENT_METHOD_LABEL[v] : "—";
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
  holderDocument: string | null;
  currency: string;
  instructions: string | null;
  isActive: boolean;
  sortOrder: number;
}

/** Copia guardada en el pedido (lo que vio el cliente). */
export type BankAccountSnapshot = Omit<BankAccount, "isActive" | "sortOrder">;

interface BankAccountRow {
  id: string;
  bank_name: string;
  account_type: string;
  account_number: string;
  holder_name: string;
  holder_document: string | null;
  currency: string;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
}

function mapBank(r: BankAccountRow): BankAccount {
  return {
    id: r.id,
    bankName: r.bank_name,
    accountType: r.account_type,
    accountNumber: r.account_number,
    holderName: r.holder_name,
    holderDocument: r.holder_document,
    currency: r.currency,
    instructions: r.instructions,
    isActive: r.is_active,
    sortOrder: r.sort_order,
  };
}

export function bankSnapshot(b: BankAccount): BankAccountSnapshot {
  const { isActive: _a, sortOrder: _s, ...rest } = b;
  return rest;
}

/** Una cuenta es publicable si está activa y tiene número y titular. */
export function isBankAccountUsable(b: BankAccount): boolean {
  return b.isActive && b.accountNumber.trim() !== "" && b.holderName.trim() !== "";
}

export async function listBankAccounts(opts?: {
  onlyUsable?: boolean;
}): Promise<BankAccount[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select(
      "id, bank_name, account_type, account_number, holder_name, holder_document, currency, instructions, is_active, sort_order",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const all = ((data ?? []) as BankAccountRow[]).map(mapBank);
  return opts?.onlyUsable ? all.filter(isBankAccountUsable) : all;
}

export async function getBankAccount(id: string): Promise<BankAccount | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("bank_accounts")
    .select(
      "id, bank_name, account_type, account_number, holder_name, holder_document, currency, instructions, is_active, sort_order",
    )
    .eq("id", id)
    .maybeSingle();
  return data ? mapBank(data as BankAccountRow) : null;
}

export interface BankAccountInput {
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
  holderDocument: string | null;
  currency: string;
  instructions: string | null;
  isActive: boolean;
  sortOrder: number;
}

function toRow(i: BankAccountInput) {
  return {
    bank_name: i.bankName,
    account_type: i.accountType,
    account_number: i.accountNumber,
    holder_name: i.holderName,
    holder_document: i.holderDocument,
    currency: i.currency,
    instructions: i.instructions,
    is_active: i.isActive,
    sort_order: i.sortOrder,
    updated_at: new Date().toISOString(),
  };
}

export async function createBankAccount(input: BankAccountInput): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("bank_accounts").insert(toRow(input));
  if (error) throw new Error(error.message);
}

export async function updateBankAccount(
  id: string,
  input: BankAccountInput,
): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("bank_accounts")
    .update(toRow(input))
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteBankAccount(id: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("bank_accounts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Ajustes de métodos de pago
// ---------------------------------------------------------------------------

export const PAYMENT_SETTINGS_KEY = "payment_methods";

export interface PaymentSettings {
  cashOnDelivery: boolean;
  bankTransfer: boolean;
  cashOnDeliveryNote: string;
  bankTransferNote: string;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  cashOnDelivery: true,
  bankTransfer: true,
  cashOnDeliveryNote: "Pagas en efectivo al recibir tu pedido.",
  bankTransferNote:
    "Transfiere el total y envíanos el comprobante por WhatsApp con tu número de pedido.",
};

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const raw = await getSetting(PAYMENT_SETTINGS_KEY);
  if (!raw) return DEFAULT_PAYMENT_SETTINGS;
  try {
    return { ...DEFAULT_PAYMENT_SETTINGS, ...(JSON.parse(raw) as Partial<PaymentSettings>) };
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

export async function setPaymentSettings(s: PaymentSettings): Promise<void> {
  await setSetting(PAYMENT_SETTINGS_KEY, JSON.stringify(s));
}

/** Lo que el checkout público necesita: métodos habilitados + cuentas usables. */
export interface CheckoutPaymentOptions {
  methods: { method: PaymentMethod; label: string; note: string }[];
  bankAccounts: BankAccountSnapshot[];
}

export async function getCheckoutPaymentOptions(): Promise<CheckoutPaymentOptions> {
  const [settings, banks] = await Promise.all([
    getPaymentSettings(),
    listBankAccounts({ onlyUsable: true }).catch(() => [] as BankAccount[]),
  ]);
  const methods: CheckoutPaymentOptions["methods"] = [];
  if (settings.cashOnDelivery) {
    methods.push({
      method: "cash_on_delivery",
      label: PAYMENT_METHOD_LABEL.cash_on_delivery,
      note: settings.cashOnDeliveryNote,
    });
  }
  // Transferencia solo si hay al menos una cuenta publicable.
  if (settings.bankTransfer && banks.length > 0) {
    methods.push({
      method: "bank_transfer",
      label: PAYMENT_METHOD_LABEL.bank_transfer,
      note: settings.bankTransferNote,
    });
  }
  // Nunca dejar el checkout sin método: contra entrega como respaldo.
  if (methods.length === 0) {
    methods.push({
      method: "cash_on_delivery",
      label: PAYMENT_METHOD_LABEL.cash_on_delivery,
      note: settings.cashOnDeliveryNote,
    });
  }
  return { methods, bankAccounts: banks.map(bankSnapshot) };
}

// ---------------------------------------------------------------------------
// Envío gratis configurable
// ---------------------------------------------------------------------------

export const FREE_SHIPPING_SETTING_KEY = "free_shipping_min_cents";

/** Umbral de envío gratis en centavos (0 = desactivado). */
export async function getFreeShippingMinCents(): Promise<number> {
  const raw = await getSetting(FREE_SHIPPING_SETTING_KEY);
  const n = raw == null ? Number.NaN : Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 0) return n;
  return Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_CENTS ?? "350000");
}
