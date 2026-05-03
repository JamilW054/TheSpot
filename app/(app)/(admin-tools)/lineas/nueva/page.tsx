import { PageLayout } from "@/components/layout";
import Link from "next/link";

export default function NuevaLineaPage() {
  return (
    <PageLayout title="Nueva línea">
      <p className="text-muted-foreground">
        Formulario de creación de línea en construcción.
      </p>
      <Link href="/lineas" className="mt-4 text-primary hover:underline">
        Volver a Líneas
      </Link>
    </PageLayout>
  );
}
