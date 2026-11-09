"use client";

import { Loader2, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import { adminSaveFreeShipping } from "@/lib/actions/payments-admin";

export function FreeShippingForm({ initialCents }: { initialCents: number }) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const [value, setValue] = useState(String(initialCents / 100));
  const [pending, start] = useTransition();

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Envío gratis</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const pesos = Number.parseFloat(value.replace(",", "."));
            start(async () => {
              const res = await adminSaveFreeShipping(pesos);
              if (!res.ok) return showError(res.error);
              showSuccess(
                pesos > 0
                  ? "Umbral de envío gratis guardado."
                  : "Envío gratis desactivado.",
              );
              router.refresh();
            });
          }}
        >
          <label className="block text-sm font-medium" htmlFor="free-shipping">
            Envío gratis a partir de (RD$)
          </label>
          <input
            id="free-shipping"
            type="number"
            min={0}
            step="1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-10 w-48 rounded-md border border-border bg-background px-3 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Si el subtotal del carrito llega a este monto, el envío es gratis.
            Pon 0 para cobrar siempre el envío. Los precios de envío se editan
            en «Métodos de envío».
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Truck className="size-4" aria-hidden />
            )}
            Guardar
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
