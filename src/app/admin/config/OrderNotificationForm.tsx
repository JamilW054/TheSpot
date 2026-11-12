"use client";

import { Loader2, Mail } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import { updateOrderNotificationEmail } from "@/lib/actions/settings-admin";

export function OrderNotificationForm({
  initialEmail,
}: {
  initialEmail: string;
}) {
  const { showSuccess, showError } = useAdminFeedback();
  const [state, formAction, pending] = useActionState(
    updateOrderNotificationEmail,
    undefined,
  );

  const seen = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seen.current) return;
    seen.current = state;
    if (state.ok) {
      showSuccess("Correo de notificaciones guardado.");
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, showSuccess, showError]);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Correo de avisos de la plataforma</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <Input
            label="Correo que recibe los avisos de nuevos pedidos"
            type="email"
            name="order_notification_email"
            defaultValue={initialEmail}
            required
            placeholder="pedidos@ejemplo.com"
          />
          <p className="text-xs text-muted-foreground">
            Aquí te avisamos cuando un negocio solicite abrir su tienda. Los
            avisos de pedidos llegan al correo de cada tienda.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Mail className="size-4" aria-hidden />
            )}
            Guardar correo
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
