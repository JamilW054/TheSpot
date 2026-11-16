"use client";

import { Flag, Loader2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { reportProductAction } from "@/lib/actions/moderation";
import {
  REPORT_REASON_LABEL,
  REPORT_REASONS,
  type ReportReason,
} from "@/lib/stores/status";

/** Botón "Reportar producto" de la ficha: abre un formulario corto. */
export function ReportProductButton({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | "">("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
      >
        <Flag className="size-3.5" aria-hidden /> Reportar producto
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold">Reportar este producto</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      {msg?.ok ? (
        <p className="text-emerald-700">{msg.text}</p>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!reason) {
              setMsg({ ok: false, text: "Elige un motivo." });
              return;
            }
            start(async () => {
              const res = await reportProductAction({
                productId,
                reason,
                details,
                email,
              });
              setMsg(
                res.ok
                  ? { ok: true, text: "Gracias. Nuestro equipo lo revisará." }
                  : { ok: false, text: res.error },
              );
            });
          }}
        >
          <fieldset className="space-y-1.5">
            <legend className="sr-only">Motivo</legend>
            {REPORT_REASONS.map((r) => (
              <label key={r} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-primary"
                />
                {REPORT_REASON_LABEL[r]}
              </label>
            ))}
          </fieldset>
          <textarea
            rows={2}
            maxLength={1000}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Detalles (opcional)"
            aria-label="Detalles"
            className="w-full rounded-xl border border-border bg-background px-3 py-2"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu correo (opcional)"
            aria-label="Tu correo"
            className="h-10 w-full rounded-xl border border-border bg-background px-3"
          />
          {msg && !msg.ok ? (
            <p className="text-destructive">{msg.text}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 font-semibold text-background disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            Enviar reporte
          </button>
        </form>
      )}
    </div>
  );
}
