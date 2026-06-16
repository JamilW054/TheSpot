import { getAddresses } from "@/lib/db/addresses";
import { DireccionesContent } from "./DireccionesContent";

export const metadata = {
  title: "Direcciones | Buxxep",
  description: "Gestiona tus direcciones de envío.",
};

export const dynamic = "force-dynamic";

export default async function DireccionesPage() {
  const addresses = await getAddresses();

  return (
    <article className="w-full max-w-lg px-4 sm:px-6 pb-20 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Direcciones
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tus direcciones guardadas para envíos.
        </p>
      </header>

      <DireccionesContent initialAddresses={addresses} />
    </article>
  );
}
