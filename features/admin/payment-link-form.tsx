"use client";

import { Link2, Loader2, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import {
  type CustomerOption,
  CustomerPicker,
} from "@/features/admin/customer-picker";
import { adminSendPaymentLink } from "@/lib/actions/payments-admin";

const labelCls = "block text-[13px] font-medium text-foreground mb-1.5";

export function PaymentLinkForm({ users }: { users: CustomerOption[] }) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const [state, formAction, pending] = useActionState(
    adminSendPaymentLink,
    undefined,
  );

  const seen = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seen.current) return;
    seen.current = state;
    if (state.ok) {
      showSuccess("Enlace de pago enviado.", () => {
        router.replace("/admin/pagos");
        router.refresh();
      });
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, showSuccess, showError, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* ── Tipo de pago: Payment Link (único método manual) ── */}
      <section className="rounded-[14px] border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Link2 className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Payment Link
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Enlace de pago seguro enviado al cliente por correo.
            </p>
          </div>
        </div>
      </section>

      {/* ── Cliente + monto + descripción ── */}
      <section className="rounded-[14px] border border-border bg-card p-5 space-y-5">
        <CustomerPicker customers={users} name="user_id" />

        <div className="space-y-1.5">
          <label htmlFor="pay-amount" className={labelCls}>
            Monto (DOP) <span className="text-destructive">*</span>
          </label>
          <Input
            id="pay-amount"
            name="amount"
            type="text"
            inputMode="decimal"
            required
            placeholder="0.00"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pay-desc" className={labelCls}>
            Descripción{" "}
            <span className="font-normal text-muted-foreground">
              (opcional)
            </span>
          </label>
          <Textarea
            id="pay-desc"
            name="description"
            rows={3}
            placeholder="Ej. Pago pendiente del pedido #1234"
          />
        </div>
      </section>

      {/* ── Enlace ── */}
      <section className="rounded-[14px] border border-border bg-card p-5 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="pay-url" className={labelCls}>
            Enlace de pago (URL) <span className="text-destructive">*</span>
          </label>
          <Input
            id="pay-url"
            name="payment_url"
            type="url"
            required
            placeholder="https://…"
          />
          <p className="text-xs text-muted-foreground">
            Genera o pega el enlace de pago. El cliente lo abrirá en una pestaña
            nueva. El enlace no caduca: permanece válido hasta que se pague, se
            cancele o se deshabilite.
          </p>
        </div>
      </section>

      {/* ── Acciones ── */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Send className="size-4" aria-hidden />
          )}
          Enviar enlace de pago
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/pagos")}
          className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
          Cancelar
        </button>
      </div>
    </form>
  );
}
