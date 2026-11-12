import type { Metadata } from "next";
import { RegisterStoreClient } from "./RegisterStoreClient";

export const metadata: Metadata = {
  title: "Registrar mi tienda",
  description: "Solicita abrir tu tienda en The Spot.",
};

export default function RegistroTiendaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
        Vende en The Spot
      </p>
      <h1 className="text-3xl font-black tracking-tight">Registra tu tienda</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Completa tus datos. Revisamos cada solicitud y te avisamos por correo
        cuando tu tienda esté aprobada.
      </p>
      <div className="mt-8">
        <RegisterStoreClient />
      </div>
    </div>
  );
}
