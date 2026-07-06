"use client";

import { Loader2, Save } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  AdminBadge,
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import type { PaymentMethodOption } from "@/database/repositories/payments";
import {
  type PaymentMethodActionState,
  updatePaymentMethod,
} from "@/lib/actions/payment-methods-admin";

/** Interruptor "Disponible" — pill de dos posiciones con el acento de marca. */
function AvailableToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        checked ? "bg-(--admin-brand)" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
        aria-hidden
      />
    </button>
  );
}

function PaymentMethodCard({ method }: { method: PaymentMethodOption }) {
  const { showSuccess, showError } = useAdminFeedback();
  const [state, formAction, pending] = useActionState<
    PaymentMethodActionState | undefined,
    FormData
  >(updatePaymentMethod, undefined);

  const initiallyAvailable = method.isActive && !method.isDisabled;
  const [available, setAvailable] = useState(initiallyAvailable);

  const seen = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seen.current) return;
    seen.current = state;
    if (state.ok) showSuccess("Método de pago actualizado.");
    else if (state.error) showError(state.error);
  }, [state, showSuccess, showError]);

  return (
    <AdminCard>
      <AdminCardHeader>
        <AdminCardTitle>{method.name}</AdminCardTitle>
        <AdminBadge tone={available ? "success" : "neutral"} dot>
          {available ? "Disponible" : "No disponible"}
        </AdminBadge>
      </AdminCardHeader>
      <AdminCardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={method.id} />

          <Input
            label="Nombre"
            name="name"
            defaultValue={method.name}
            required
            placeholder="Ej. Pay with Azul"
          />
          <Textarea
            label="Descripción"
            name="description"
            defaultValue={method.description ?? ""}
            rows={2}
            placeholder="Texto que ve el cliente en el checkout"
          />

          {/* Disponibilidad — lo más importante de esta tarjeta */}
          <div className="flex items-center justify-between gap-4 rounded-[10px] border border-border bg-muted/40 p-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Disponible en el checkout
              </p>
              <p className="text-xs text-muted-foreground">
                {available
                  ? "Los clientes pueden seleccionarlo para pagar."
                  : "Se muestra bloqueado con una etiqueta (ej. “Próximamente”)."}
              </p>
            </div>
            <AvailableToggle checked={available} onChange={setAvailable} />
            {/* Refleja el estado del switch para el envío del form (mismo
                contrato que un checkbox: presente + "on" = true, ausente = false). */}
            {available ? (
              <input type="hidden" name="available" value="on" />
            ) : null}
          </div>

          {!available ? (
            <Input
              label="Etiqueta mostrada"
              name="badge_label"
              defaultValue={method.badgeLabel ?? ""}
              placeholder="Próximamente"
              help="Se muestra junto al nombre mientras no esté disponible."
            />
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[18px] bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Save className="size-4" aria-hidden />
              )}
              Guardar
            </button>
          </div>
        </form>
      </AdminCardContent>
    </AdminCard>
  );
}

export function PaymentMethodsManager({
  methods,
}: {
  methods: PaymentMethodOption[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {methods.map((m) => (
        <PaymentMethodCard key={m.id} method={m} />
      ))}
    </div>
  );
}
