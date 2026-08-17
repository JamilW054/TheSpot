"use client";

import { Loader2, MessageCircle } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import { updateWhatsAppNumber } from "@/lib/actions/settings-admin";

export function WhatsAppNumberForm({
  initialNumber,
}: {
  initialNumber: string;
}) {
  const { showSuccess, showError } = useAdminFeedback();
  const [state, formAction, pending] = useActionState(
    updateWhatsAppNumber,
    undefined,
  );

  const seen = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seen.current) return;
    seen.current = state;
    if (state.ok) {
      showSuccess("Número de WhatsApp guardado.");
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, showSuccess, showError]);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>WhatsApp de la tienda</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <Input
            label="Número de WhatsApp (con código de país)"
            type="tel"
            name="whatsapp_number"
            defaultValue={initialNumber}
            required
            placeholder="18091234567"
          />
          <p className="text-xs text-muted-foreground">
            Los clientes usan este número para confirmar sus pedidos por
            WhatsApp al terminar el checkout.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <MessageCircle className="size-4" aria-hidden />
            )}
            Guardar número
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
