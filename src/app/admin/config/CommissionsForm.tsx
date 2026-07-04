"use client";

import { Loader2, Percent } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import { updateCommissionPercents } from "@/lib/actions/settings-admin";

export function CommissionsForm({
  initialAzulPercent,
  initialG3deonPercent,
}: {
  initialAzulPercent: number;
  initialG3deonPercent: number;
}) {
  const { showSuccess, showError } = useAdminFeedback();
  const [state, formAction, pending] = useActionState(
    updateCommissionPercents,
    undefined,
  );

  const seen = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seen.current) return;
    seen.current = state;
    if (state.ok) {
      showSuccess("Comisiones guardadas.");
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, showSuccess, showError]);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Comisiones por venta</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Comisión AZUL (%)"
              type="text"
              inputMode="decimal"
              name="azul_commission_percent"
              defaultValue={initialAzulPercent.toFixed(2)}
              required
              placeholder="5.00"
            />
            <Input
              label="Comisión G3DEON (%)"
              type="text"
              inputMode="decimal"
              name="g3deon_commission_percent"
              defaultValue={initialG3deonPercent.toFixed(2)}
              required
              placeholder="12.00"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Ambas se descuentan del precio de venta al calcular el beneficio
            neto y el margen de cada producto: beneficio = precio − coste −
            (precio × %AZUL) − (precio × %G3DEON).
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[18px] bg-primary px-4 font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Percent className="size-4" aria-hidden />
            )}
            Guardar comisiones
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
