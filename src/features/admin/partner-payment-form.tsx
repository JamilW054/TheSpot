"use client";

import { Plus, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { adminRegisterPartnerPayment } from "@/lib/actions/partners-admin";
import { formatDOPFromCents } from "@/lib/format-currency";
import { partnerPaymentFields } from "./resource-fields";
import { ResourceForm } from "./resource-form";

/**
 * Referencia del pago. Por defecto no se envía nada y el backend genera una
 * única y buscable (`PGO-202607-A7F3K9`) — el admin no tiene que inventarse un
 * identificador para un pago que ya tiene su comprobante bancario. Si prefiere
 * usar el número real de la transferencia o del cheque, activa el interruptor y
 * lo escribe; el índice único de la BD impide que se repita.
 *
 * Es un campo condicional, así que no puede vivir en `partnerPaymentFields`:
 * el formulario genérico solo pinta listas planas de campos.
 */
function PaymentReferenceField() {
  const [custom, setCustom] = useState(false);

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          checked={custom}
          onChange={(e) => setCustom(e.target.checked)}
          className="size-4 rounded border-border accent-primary"
        />
        Usar mi propia referencia
      </label>

      {custom ? (
        <Input
          name="reference"
          label="Referencia"
          placeholder="Nº de transferencia, cheque…"
          required
          help="Debe ser única: no puede repetirse en otro pago."
        />
      ) : (
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Wand2 className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Se generará una referencia automática (p. ej.{" "}
          <span className="font-medium text-foreground">PGO-202607-A7F3K9</span>
          ) con la que podrás localizar el pago.
        </p>
      )}
    </div>
  );
}

/**
 * Alta de un pago a un socio, desde su ficha. Solo crea: `partner_payments` es
 * append-only (trigger en BD), así que no hay editar ni borrar que ofrecer —
 * un pago mal registrado se corrige con otro de importe negativo.
 */
export function PartnerPaymentForm({
  partnerId,
  partnerName,
  balanceCents,
}: {
  partnerId: string;
  partnerName: string;
  /** Pendiente del mes en curso: alimenta la ayuda del importe (el tope real lo aplica el servidor). */
  balanceCents: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Remonta el formulario en cada apertura para no arrastrar el pago anterior.
  const [formKey, setFormKey] = useState(0);

  const close = useCallback(() => setOpen(false), []);

  const handleSuccess = useCallback(() => {
    setOpen(false);
    router.refresh();
  }, [router]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setFormKey((k) => k + 1);
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-[18px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <Plus className="size-4" aria-hidden />
        Registrar pago
      </button>

      <Drawer
        open={open}
        onClose={close}
        title={`Registrar pago · ${partnerName}`}
      >
        <ResourceForm
          key={formKey}
          mode="create"
          entityLabel="el pago"
          fields={partnerPaymentFields(partnerId, balanceCents)}
          action={adminRegisterPartnerPayment}
          onSuccess={handleSuccess}
          onCancel={close}
        >
          <div className="rounded-[18px] border border-border bg-muted/20 px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Pendiente este mes:{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {formatDOPFromCents(Math.max(0, balanceCents))}
              </span>
            </p>
          </div>
          <PaymentReferenceField />
        </ResourceForm>
      </Drawer>
    </>
  );
}
