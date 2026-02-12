import { PageLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { MOCK_LINEAS } from "@/config/mock-data";
import { parseSlugId } from "@/lib/slug";
import type { Linea } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LineaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const linea: Linea | null =
    MOCK_LINEAS.find((l) => l.slug === slug) ??
    (() => {
      const id = parseSlugId(slug);
      return id ? (MOCK_LINEAS.find((l) => l.id === id) ?? null) : null;
    })();

  if (!linea) {
    notFound();
  }

  const galleryImages = [linea.coverImage, ...linea.gallery];
  const productLabel =
    linea.items === 1 ? "1 producto en la línea" : `${linea.items} productos en la línea`;

  return (
    <PageLayout title={linea.name}>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {linea.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={linea.published ? "success" : "warning"}>
            {linea.published ? "Publicada" : "Borrador"}
          </Badge>
          <span className="text-sm text-muted-foreground">{productLabel}</span>
        </div>
      </header>

      <section aria-label="Galería de la línea" className="space-y-3">
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

      <p className="text-muted-foreground">{linea.description}</p>

      <section aria-label="Productos de la línea" className="space-y-2">
        <h2 className="text-lg font-medium text-foreground">Productos de la línea</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {Array.from({ length: Math.min(linea.items, 6) }, (_, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm"
            >
              <span className="size-10 shrink-0 rounded bg-muted" aria-hidden />
              <span className="text-foreground">Producto {i + 1}</span>
            </li>
          ))}
        </ul>
        {linea.items > 6 && (
          <p className="text-sm text-muted-foreground">
            y {linea.items - 6} productos más
          </p>
        )}
      </section>

      <div className="pt-2">
        <Link
          href="/lineas"
          className="inline-flex h-10 items-center justify-center rounded-md border-2 border-border bg-transparent px-4 font-medium hover:bg-muted"
        >
          Volver a Líneas
        </Link>
      </div>
    </PageLayout>
  );
}
