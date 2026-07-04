import { LineaCard } from "@/components/lineas";
import { PageLayout } from "@/components/layout";
import { getLineas } from "@/database/repositories";
import Link from "next/link";

export default async function LineasPage() {
  const lineas = await getLineas();
  if (lineas.length === 0) {
    return (
      <PageLayout title="Líneas de ropa">
        <section
          aria-label="Sin líneas"
          className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-16 text-center"
        >
          <p className="text-lg font-medium text-foreground">
            Aún no tienes líneas de ropa
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Crea tu primera línea para organizar tus productos y colecciones.
          </p>
          <Link
            href="/lineas/nueva"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground hover:opacity-90"
          >
            Crear primera línea
          </Link>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Líneas de ropa">
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {lineas.map((linea) => (
          <LineaCard key={linea.id} linea={linea} />
        ))}
      </div>
    </PageLayout>
  );
}
