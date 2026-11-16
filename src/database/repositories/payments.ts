import { createServiceClient } from "@/lib/supabase/server";

/**
 * Métodos de pago offline de cada tienda (no hay pasarela; cada tienda cobra):
 * - `cash_on_delivery`: el cliente paga al recibir.
 * - `bank_transfer`: el cliente transfiere a una de las cuentas activas de la tienda.
 * Cada tienda lo administra en /panel/pagos (`stores.payment_methods` + `bank_accounts.store_id`).
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

export async function listBankAccounts(opts: {
  storeId: string;
  onlyUsable?: boolean;
}): Promise<BankAccount[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select(
      "id, bank_name, account_type, account_number, holder_name, holder_document, currency, instructions, is_active, sort_order",
    )
    .eq("store_id", opts.storeId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const all = ((data ?? []) as BankAccountRow[]).map(mapBank);
  return opts.onlyUsable ? all.filter(isBankAccountUsable) : all;
}

/** Cuenta por id, solo si pertenece a `storeId`. */
export async function getBankAccount(id: string, storeId: string): Promise<BankAccount | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("bank_accounts")
    .select(
      "id, bank_name, account_type, account_number, holder_name, holder_document, currency, instructions, is_active, sort_order",
    )
    .eq("id", id)
    .eq("store_id", storeId)
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

export async function createBankAccount(storeId: string, input: BankAccountInput): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("bank_accounts").insert({ ...toRow(input), store_id: storeId });
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

export function parsePaymentSettings(raw: unknown): PaymentSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_PAYMENT_SETTINGS;
  const r = raw as Partial<PaymentSettings>;
  return {
    cashOnDelivery: typeof r.cashOnDelivery === "boolean" ? r.cashOnDelivery : true,
    bankTransfer: typeof r.bankTransfer === "boolean" ? r.bankTransfer : true,
    cashOnDeliveryNote: r.cashOnDeliveryNote || DEFAULT_PAYMENT_SETTINGS.cashOnDeliveryNote,
    bankTransferNote: r.bankTransferNote || DEFAULT_PAYMENT_SETTINGS.bankTransferNote,
  };
}

export async function getPaymentSettings(storeId: string): Promise<PaymentSettings> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("stores")
    .select("payment_methods")
    .eq("id", storeId)
    .maybeSingle();
  return parsePaymentSettings((data as { payment_methods?: unknown } | null)?.payment_methods);
}

export async function setPaymentSettings(storeId: string, s: PaymentSettings): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("stores")
    .update({ payment_methods: s, updated_at: new Date().toISOString() })
    .eq("id", storeId);
  if (error) throw new Error(error.message);
}

/** Lo que el checkout público necesita: métodos habilitados + cuentas usables. */
export interface CheckoutPaymentOptions {
  methods: { method: PaymentMethod; label: string; note: string }[];
  bankAccounts: BankAccountSnapshot[];
}

/** Opciones de pago a partir de ajustes y cuentas ya cargados (puro). */
export function buildCheckoutPaymentOptions(
  settings: PaymentSettings,
  banks: BankAccount[],
): CheckoutPaymentOptions {
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

export async function getCheckoutPaymentOptions(storeId: string): Promise<CheckoutPaymentOptions> {
  const [settings, banks] = await Promise.all([
    getPaymentSettings(storeId),
    listBankAccounts({ storeId, onlyUsable: true }).catch(() => [] as BankAccount[]),
  ]);
  return buildCheckoutPaymentOptions(settings, banks);
}

/** Opciones de pago de varias tiendas a la vez (checkout dividido). */
export async function getCheckoutPaymentOptionsByStore(
  storeIds: string[],
): Promise<Record<string, CheckoutPaymentOptions>> {
  const unique = [...new Set(storeIds.filter(Boolean))];
  const out: Record<string, CheckoutPaymentOptions> = {};
  if (unique.length === 0) return out;
  const supabase = createServiceClient();
  const [{ data: stores }, { data: banks }] = await Promise.all([
    supabase.from("stores").select("id, payment_methods").in("id", unique),
    supabase
      .from("bank_accounts")
      .select(
        "id, store_id, bank_name, account_type, account_number, holder_name, holder_document, currency, instructions, is_active, sort_order",
      )
      .in("store_id", unique)
      .order("sort_order", { ascending: true }),
  ]);
  const banksByStore = new Map<string, BankAccount[]>();
  for (const r of (banks ?? []) as (BankAccountRow & { store_id: string })[]) {
    const b = mapBank(r);
    if (!isBankAccountUsable(b)) continue;
    const list = banksByStore.get(r.store_id) ?? [];
    list.push(b);
    banksByStore.set(r.store_id, list);
  }
  for (const st of (stores ?? []) as { id: string; payment_methods: unknown }[]) {
    out[st.id] = buildCheckoutPaymentOptions(
      parsePaymentSettings(st.payment_methods),
      banksByStore.get(st.id) ?? [],
    );
  }
  return out;
}

// ---------------------------------------------------------------------------
// Envío gratis configurable
// ---------------------------------------------------------------------------

/** Umbral de envío gratis de una tienda en centavos (0 = desactivado). */
export async function getFreeShippingMinCents(storeId: string): Promise<number> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("stores")
    .select("free_shipping_min_cents")
    .eq("id", storeId)
    .maybeSingle();
  const n = Number((data as { free_shipping_min_cents?: number | null } | null)?.free_shipping_min_cents ?? 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function setFreeShippingMinCents(storeId: string, cents: number): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("stores")
    .update({ free_shipping_min_cents: cents > 0 ? cents : null, updated_at: new Date().toISOString() })
    .eq("id", storeId);
  if (error) throw new Error(error.message);
}
