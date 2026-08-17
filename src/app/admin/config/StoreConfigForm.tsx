"use client";

import { Loader2, Save } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import type { StoreConfig } from "@/database/repositories/settings";
import { updateStoreConfig } from "@/lib/actions/settings-admin";

export function StoreConfigForm({ initial }: { initial: StoreConfig }) {
  const { showSuccess, showError } = useAdminFeedback();
  const [state, formAction, pending] = useActionState(
    updateStoreConfig,
    undefined,
  );

  const seen = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seen.current) return;
    seen.current = state;
    if (state.ok) showSuccess("Configuración guardada.");
    else if (state.error) showError(state.error);
  }, [state, showSuccess, showError]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Tienda */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Tienda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nombre de la tienda"
            name="nombre"
            defaultValue={initial.nombre}
            placeholder="Ej. JW PARFUM"
          />
          <Input
            label="Dirección"
            name="direccion"
            defaultValue={initial.direccion}
            placeholder="Calle, número, ciudad"
          />
          <Input
            label="Contacto (email)"
            type="email"
            name="contacto"
            defaultValue={initial.contacto}
            placeholder="jamilwilliams054@gmail.com"
          />
          <Input
            label="Teléfono"
            type="tel"
            name="telefono"
            defaultValue={initial.telefono}
            placeholder="+1 (809) 000-0000"
          />
        </CardContent>
      </Card>

      {/* Producción */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Producción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Plazo de producción (días)"
            type="number"
            name="plazo_dias"
            min={1}
            defaultValue={initial.plazoDias}
            placeholder="Ej. 5"
          />
          <Input
            label="Tipos de producto"
            name="tipos_producto"
            defaultValue={initial.tiposProducto}
            placeholder="Ej. Camisetas, Hoodies, Gorras"
          />
        </CardContent>
      </Card>

      {/* Logística */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Logística</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              name="envio_activo"
              defaultChecked={initial.envioActivo}
              className="size-4 rounded border-border accent-primary"
            />
            Envíos activos
          </label>
          <Input
            label="Zonas de envío"
            name="zonas"
            defaultValue={initial.zonas}
            placeholder="Ej. Santo Domingo, Santiago, todo el país"
          />
        </CardContent>
      </Card>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Save className="size-4" aria-hidden />
        )}
        Guardar
      </button>
    </form>
  );
}
