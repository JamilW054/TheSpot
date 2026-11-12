"use client";

import { usePanelBase } from "@/lib/panel-base";
import {
  Banknote,
  Eye,
  Landmark,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AdminBadge,
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
  AdminPageHeader,
} from "@/components/admin/ui";
import { BankAccountCard } from "@/components/checkout/BankAccountCard";
import { ConfirmDialog, type ConfirmDialogState } from "@/components/ui/confirm-dialog";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import type { BankAccount, PaymentSettings } from "@/database/repositories/payments";
import {
  adminDeleteBankAccount,
  adminSaveBankAccount,
  adminSavePaymentSettings,
} from "@/lib/actions/payments-admin";

const BANKS = [
  "Banreservas",
  "Banco Popular",
  "BHD",
  "Scotiabank",
  "Banco Santa Cruz",
  "Asociación Popular (APAP)",
  "Banco Caribe",
  "Banesco",
  "Banco López de Haro",
  "Banco Promerica",
];

const ACCOUNT_TYPES = ["Ahorros", "Corriente"];

const input =
  "h-10 w-full rounded-[10px] border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none";
const label = "mb-1 block text-xs font-medium text-muted-foreground";

type Draft = {
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
  holderDocument: string;
  currency: string;
  instructions: string;
  isActive: boolean;
  sortOrder: number;
};

const emptyDraft = (sortOrder: number): Draft => ({
  bankName: "Banreservas",
  accountType: "Ahorros",
  accountNumber: "",
  holderName: "",
  holderDocument: "",
  currency: "DOP",
  instructions: "",
  isActive: true,
  sortOrder,
});

function toDraft(a: BankAccount): Draft {
  return {
    bankName: a.bankName,
    accountType: a.accountType,
    accountNumber: a.accountNumber,
    holderName: a.holderName,
    holderDocument: a.holderDocument ?? "",
    currency: a.currency,
    instructions: a.instructions ?? "",
    isActive: a.isActive,
    sortOrder: a.sortOrder,
  };
}

function BankForm({
  account,
  sortOrder,
  onDone,
  onCancel,
}: {
  account: BankAccount | null;
  sortOrder: number;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const { showSuccess, showError } = useAdminFeedback();
  const [d, setD] = useState<Draft>(account ? toDraft(account) : emptyDraft(sortOrder));
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState<ConfirmDialogState | null>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const bankListId = `banks-${account?.id ?? "new"}`;
  const complete = d.accountNumber.trim() !== "" && d.holderName.trim() !== "";

  const save = () =>
    start(async () => {
      const res = await adminSaveBankAccount(account?.id ?? null, d);
      if (!res.ok) return showError(res.error);
      showSuccess(account ? "Cuenta actualizada." : "Cuenta agregada.");
      onDone();
    });

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      {confirm ? <ConfirmDialog state={confirm} onCancel={() => setConfirm(null)} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${bankListId}-bank`}>
            Banco
          </label>
          <input
            id={`${bankListId}-bank`}
            list={bankListId}
            value={d.bankName}
            onChange={(e) => set("bankName", e.target.value)}
            className={input}
          />
          <datalist id={bankListId}>
            {BANKS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={label} htmlFor={`${bankListId}-type`}>
            Tipo de cuenta
          </label>
          <select
            id={`${bankListId}-type`}
            value={d.accountType}
            onChange={(e) => set("accountType", e.target.value)}
            className={input}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor={`${bankListId}-num`}>
            Número de cuenta
          </label>
          <input
            id={`${bankListId}-num`}
            value={d.accountNumber}
            onChange={(e) => set("accountNumber", e.target.value)}
            inputMode="numeric"
            placeholder="Ej. 960-123456-7"
            className={`${input} font-mono`}
          />
        </div>
        <div>
          <label className={label} htmlFor={`${bankListId}-cur`}>
            Moneda
          </label>
          <select
            id={`${bankListId}-cur`}
            value={d.currency}
            onChange={(e) => set("currency", e.target.value)}
            className={input}
          >
            <option value="DOP">DOP (pesos)</option>
            <option value="USD">USD (dólares)</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor={`${bankListId}-holder`}>
            Titular
          </label>
          <input
            id={`${bankListId}-holder`}
            value={d.holderName}
            onChange={(e) => set("holderName", e.target.value)}
            placeholder="Nombre como aparece en el banco"
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor={`${bankListId}-doc`}>
            Cédula / RNC (opcional)
          </label>
          <input
            id={`${bankListId}-doc`}
            value={d.holderDocument}
            onChange={(e) => set("holderDocument", e.target.value)}
            placeholder="001-0000000-0"
            className={`${input} font-mono`}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor={`${bankListId}-ins`}>
            Indicaciones para el cliente (opcional)
          </label>
          <input
            id={`${bankListId}-ins`}
            value={d.instructions}
            onChange={(e) => set("instructions", e.target.value)}
            placeholder="Ej. Desde otros bancos usa transferencia ACH."
            className={input}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={d.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="size-4 accent-primary"
            />
            Mostrar a los clientes en el checkout
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            Orden
            <input
              type="number"
              value={d.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
              className="h-8 w-16 rounded-md border border-border bg-background px-2 text-sm"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Save className="size-4" aria-hidden />
            )}
            {account ? "Guardar cambios" : "Agregar cuenta"}
          </button>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="h-9 rounded-full border border-border px-4 text-sm"
            >
              Cancelar
            </button>
          ) : null}
          {account ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                setConfirm({
                  title: `¿Eliminar la cuenta de ${account.bankName}?`,
                  description:
                    "Dejará de mostrarse en el checkout. Los pedidos anteriores conservan los datos que vio el cliente.",
                  confirmLabel: "Eliminar",
                  variant: "danger",
                  onConfirm: () => {
                    setConfirm(null);
                    start(async () => {
                      const res = await adminDeleteBankAccount(account.id);
                      if (!res.ok) return showError(res.error);
                      showSuccess("Cuenta eliminada.");
                      onDone();
                    });
                  },
                })
              }
              className="ml-auto inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="size-4" aria-hidden />
              Eliminar
            </button>
          ) : null}
        </div>
      </div>
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Eye className="size-3.5" aria-hidden />
          Así lo verá el cliente
        </p>
        {complete ? (
          <BankAccountCard account={d} />
        ) : (
          <p className="rounded-[12px] border border-dashed border-border p-4 text-xs text-muted-foreground">
            Completa número de cuenta y titular para ver la vista previa. Las
            cuentas incompletas no se muestran en el checkout.
          </p>
        )}
      </div>
    </div>
  );
}

export function PaymentsAdminClient({
  settings,
  accounts,
}: {
  settings: PaymentSettings;
  accounts: BankAccount[];
}) {
  const panelBase = usePanelBase();
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const [s, setS] = useState(settings);
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const usable = accounts.filter(
    (a) => a.isActive && a.accountNumber.trim() && a.holderName.trim(),
  );

  const saveSettings = () =>
    start(async () => {
      const res = await adminSavePaymentSettings(s);
      if (!res.ok) return showError(res.error);
      showSuccess("Métodos de pago guardados.");
      router.refresh();
    });

  return (
    <div className="max-w-5xl space-y-6">
      <AdminPageHeader
        title="Pagos y cuentas bancarias"
        description="Elige qué métodos de pago ve el cliente en el checkout y administra las cuentas para transferencias. Los cambios se aplican al instante en la tienda."
        breadcrumbs={[{ label: "Dashboard", href: `${panelBase}` }, { label: "Pagos y cuentas" }]}
      />

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle>Métodos de pago</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent className="space-y-4">
          {(
            [
              ["cashOnDelivery", "cashOnDeliveryNote", "Pago contra entrega", Banknote],
              ["bankTransfer", "bankTransferNote", "Transferencia bancaria", Landmark],
            ] as const
          ).map(([flag, note, title, Icon]) => (
            <div
              key={flag}
              className={`rounded-2xl border p-4 transition-colors ${
                s[flag] ? "border-primary/40 bg-primary/5" : "border-border"
              }`}
            >
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={s[flag]}
                  onChange={(e) => setS((p) => ({ ...p, [flag]: e.target.checked }))}
                  className="size-4 accent-primary"
                />
                <Icon className="size-5 text-primary" aria-hidden />
                <span className="font-medium">{title}</span>
                {flag === "bankTransfer" ? (
                  <AdminBadge tone={usable.length > 0 ? "success" : "warning"}>
                    {usable.length > 0
                      ? `${usable.length} cuenta${usable.length !== 1 ? "s" : ""} visible${usable.length !== 1 ? "s" : ""}`
                      : "Sin cuentas activas: no se mostrará"}
                  </AdminBadge>
                ) : null}
              </label>
              <label className="mt-3 block">
                <span className={label}>Mensaje para el cliente</span>
                <input
                  value={s[note]}
                  onChange={(e) => setS((p) => ({ ...p, [note]: e.target.value }))}
                  className={input}
                />
              </label>
            </div>
          ))}
          <button
            type="button"
            onClick={saveSettings}
            disabled={pending}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Save className="size-4" aria-hidden />
            )}
            Guardar métodos
          </button>
        </AdminCardContent>
      </AdminCard>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Cuentas para transferencia</h2>
          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium hover:border-primary"
            >
              <Plus className="size-4" aria-hidden />
              Agregar cuenta
            </button>
          ) : null}
        </div>

        {adding ? (
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>Nueva cuenta</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <BankForm
                account={null}
                sortOrder={accounts.length}
                onCancel={() => setAdding(false)}
                onDone={() => {
                  setAdding(false);
                  router.refresh();
                }}
              />
            </AdminCardContent>
          </AdminCard>
        ) : null}

        {accounts.length === 0 && !adding ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay cuentas. Agrega tu cuenta de Banreservas o Popular.
          </p>
        ) : null}

        {accounts.map((a) => {
          const ok = a.isActive && a.accountNumber.trim() && a.holderName.trim();
          return (
            <AdminCard key={a.id}>
              <AdminCardHeader>
                <AdminCardTitle className="flex items-center gap-2">
                  <Landmark className="size-4 text-primary" aria-hidden />
                  {a.bankName}
                  {a.accountNumber ? (
                    <span className="font-mono text-xs font-normal text-muted-foreground">
                      {a.accountType} · {a.accountNumber}
                    </span>
                  ) : null}
                </AdminCardTitle>
                <AdminBadge tone={ok ? "success" : a.isActive ? "warning" : "neutral"} dot>
                  {ok ? "Visible en checkout" : a.isActive ? "Incompleta" : "Oculta"}
                </AdminBadge>
              </AdminCardHeader>
              <AdminCardContent>
                <BankForm
                  key={`${a.id}:${a.accountNumber}:${a.isActive}`}
                  account={a}
                  sortOrder={a.sortOrder}
                  onDone={() => router.refresh()}
                />
              </AdminCardContent>
            </AdminCard>
          );
        })}
      </div>
    </div>
  );
}
