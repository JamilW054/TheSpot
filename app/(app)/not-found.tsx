import { PageLayout } from "@/components/layout";
import Link from "next/link";

export default function AppNotFound() {
  return (
    <PageLayout title="Página no encontrada">
      <p className="text-muted-foreground">
        El recurso que buscas no existe o ha sido movido.
      </p>
      <Link href="/mis-disenos" className="text-primary hover:underline">
        Volver a Mis diseños
      </Link>
    </PageLayout>
  );
}
