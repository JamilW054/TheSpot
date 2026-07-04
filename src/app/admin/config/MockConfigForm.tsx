"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";

interface TiendaForm {
  nombre: string;
  direccion: string;
  contacto: string;
  telefono: string;
}

interface ProduccionForm {
  plazoDias: number;
  tiposProducto: string;
}

interface LogisticaForm {
  envioActivo: string;
  zonas: string;
}

const TIENDA_INITIAL: TiendaForm = {
  nombre: "",
  direccion: "",
  contacto: "",
  telefono: "",
};

const PRODUCCION_INITIAL: ProduccionForm = {
  plazoDias: 5,
  tiposProducto: "",
};

const LOGISTICA_INITIAL: LogisticaForm = {
  envioActivo: "sí",
  zonas: "",
};

export function MockConfigForm() {
  const { showSuccess } = useAdminFeedback();
  const [tienda, setTienda] = useState<TiendaForm>(TIENDA_INITIAL);
  const [produccion, setProduccion] =
    useState<ProduccionForm>(PRODUCCION_INITIAL);
  const [logistica, setLogistica] = useState<LogisticaForm>(LOGISTICA_INITIAL);

  const handleGuardar = () => {
    showSuccess("Guardado (mock)");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleGuardar();
      }}
      className="space-y-6"
    >
      {/* Tienda */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Tienda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nombre de la tienda"
            value={tienda.nombre}
            onChange={(e) =>
              setTienda((prev) => ({ ...prev, nombre: e.target.value }))
            }
            placeholder="Ej. Mi tienda Buxxep"
          />
          <Input
            label="Dirección"
            value={tienda.direccion}
            onChange={(e) =>
              setTienda((prev) => ({ ...prev, direccion: e.target.value }))
            }
            placeholder="Calle, número, ciudad, CP"
          />
          <Input
            label="Contacto (email)"
            type="email"
            value={tienda.contacto}
            onChange={(e) =>
              setTienda((prev) => ({ ...prev, contacto: e.target.value }))
            }
            placeholder="tienda@ejemplo.com"
          />
          <Input
            label="Teléfono"
            type="tel"
            value={tienda.telefono}
            onChange={(e) =>
              setTienda((prev) => ({ ...prev, telefono: e.target.value }))
            }
            placeholder="+34 600 000 000"
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
            min={1}
            value={produccion.plazoDias === 0 ? "" : produccion.plazoDias}
            onChange={(e) =>
              setProduccion((prev) => ({
                ...prev,
                plazoDias: Number(e.target.value) || 0,
              }))
            }
            placeholder="Ej. 5"
          />
          <Input
            label="Tipos de producto"
            value={produccion.tiposProducto}
            onChange={(e) =>
              setProduccion((prev) => ({
                ...prev,
                tiposProducto: e.target.value,
              }))
            }
            placeholder="Ej. Camiseta, Sudadera, Tote bag"
          />
        </CardContent>
      </Card>

      {/* Logística */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Logística</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Envíos activos"
            value={logistica.envioActivo}
            onChange={(e) =>
              setLogistica((prev) => ({
                ...prev,
                envioActivo: e.target.value,
              }))
            }
            placeholder="sí / no"
          />
          <Input
            label="Zonas de envío"
            value={logistica.zonas}
            onChange={(e) =>
              setLogistica((prev) => ({ ...prev, zonas: e.target.value }))
            }
            placeholder="Ej. España peninsular, Baleares, UE"
          />
        </CardContent>
      </Card>

      <div>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
