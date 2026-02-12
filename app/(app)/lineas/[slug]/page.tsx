import { PageLayout } from "@/components/layout";
import { MOCK_LINEAS } from "@/config/mock-data";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LineaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const linea = MOCK_LINEAS.find((l) => l.slug === slug);

  if (!linea) {
    notFound();
  }

  return (
    <PageLayout title={linea.name}>
      <p className="text-muted-foreground">{linea.description}</p>
      <p className="text-sm text-muted-foreground">
        {linea.items} {linea.items === 1 ? "producto" : "productos"} ·{" "}
        {linea.published ? "Publicada" : "Borrador"}
      </p>
      <Link href="/lineas" className="text-primary hover:underline">
        Volver a Líneas
      </Link>
    </PageLayout>
  );
}
