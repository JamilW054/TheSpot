"use client";

import { Check, Copy, Landmark } from "lucide-react";
import { useState } from "react";

export interface BankAccountView {
  bankName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
  holderDocument?: string | null;
  currency?: string;
  instructions?: string | null;
}

/** Datos de una cuenta para transferir, con copiar al portapapeles. */
export function BankAccountCard({
  account,
  amountLabel,
  className = "",
}: {
  account: BankAccountView;
  /** Monto a transferir ya formateado (opcional). */
  amountLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(account.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sin permiso de portapapeles: el número sigue visible para copiarlo a mano.
    }
  };

  return (
    <div
      className={`rounded-[12px] border border-primary/30 bg-primary/5 p-4 text-left text-sm ${className}`.trim()}
    >
      <p className="flex items-center gap-2 font-semibold text-foreground">
        <Landmark className="size-4 text-primary" aria-hidden />
        {account.bankName}
      </p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
        <dt className="text-muted-foreground">Tipo</dt>
        <dd className="text-foreground">
          {account.accountType}
          {account.currency ? ` · ${account.currency}` : ""}
        </dd>
        <dt className="text-muted-foreground">Cuenta</dt>
        <dd className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-semibold tabular-nums text-foreground">
            {account.accountNumber}
          </span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {copied ? (
              <Check className="size-3" aria-hidden />
            ) : (
              <Copy className="size-3" aria-hidden />
            )}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </dd>
        <dt className="text-muted-foreground">Titular</dt>
        <dd className="text-foreground">{account.holderName}</dd>
        {account.holderDocument ? (
          <>
            <dt className="text-muted-foreground">Cédula/RNC</dt>
            <dd className="font-mono text-foreground">
              {account.holderDocument}
            </dd>
          </>
        ) : null}
        {amountLabel ? (
          <>
            <dt className="text-muted-foreground">Monto</dt>
            <dd className="font-mono font-semibold text-primary">
              {amountLabel}
            </dd>
          </>
        ) : null}
      </dl>
      {account.instructions ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {account.instructions}
        </p>
      ) : null}
    </div>
  );
}
