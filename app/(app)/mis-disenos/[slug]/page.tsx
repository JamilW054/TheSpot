import { PageLayout } from "@/components/layout";
import { MOCK_DESIGNS } from "@/config/mock-data";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DesignDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const design = MOCK_DESIGNS.find((d) => d.slug === slug);

  if (!design) {
    notFound();
  }

  const galleryImages = [design.coverImage, ...design.gallery];

  return (
    <PageLayout title={design.name}>
      <section aria-label="Galería del diseño" className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((src, i) => (
            <div
              key={i}
              className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted"
            >
              <Image
                src={src}
                alt={`Imagen ${i + 1} de la galería`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </section>
      <p className="text-muted-foreground">{design.description}</p>
      <p className="text-sm text-muted-foreground">Actualizado: {design.updated}</p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/editor?design=${design.id}`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground hover:opacity-90"
        >
          Editar diseño
        </Link>
        <Link
          href="/mis-disenos"
          className="inline-flex h-10 items-center justify-center rounded-md border-2 border-border bg-transparent px-4 font-medium hover:bg-muted"
        >
          Volver a Mis diseños
        </Link>
      </div>
    </PageLayout>
  );
}
