import { PageLayout } from "@/components/layout";
import { MOCK_DESIGNS } from "@/config/mock-data";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DesignDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const design = MOCK_DESIGNS.find((d) => d.slug === slug);

  if (!design) {
    return (
      <PageLayout title="Diseño no encontrado">
        <p className="text-muted-foreground">No existe un diseño con ese enlace.</p>
        <Link href="/mis-disenos" className="text-primary hover:underline">
          Volver a Mis diseños
        </Link>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={design.name}>
      <p className="text-muted-foreground">{design.description}</p>
      <p className="text-sm text-muted-foreground">Actualizado: {design.updated}</p>
      <Link href="/mis-disenos" className="text-primary hover:underline">
        Volver a Mis diseños
      </Link>
    </PageLayout>
  );
}
