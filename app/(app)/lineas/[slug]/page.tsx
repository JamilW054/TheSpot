import { PageLayout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MOCK_LINEAS } from "@/config/mock-data";
import { parseSlugId } from "@/lib/slug";
import type { Linea } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const placeholder = (w: number, h: number, seed: string) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

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

  const productNames =
    (linea.products?.length ?? 0) > 0
      ? linea.products
      : Array.from(
          { length: Math.min(Math.max(linea.items, 3), 6) },
          (_, i) => `Producto ${i + 1}`
        );

  return (
    <PageLayout title={linea.name}>
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {linea.name}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant={linea.published ? "success" : "warning"}
            className="px-3 py-1 text-sm font-medium"
          >
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

      <section aria-label="Productos de esta línea" className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">
          Productos de esta línea
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(productNames ?? []).map((name, i) => (
            <li key={i}>
              <Card className="overflow-hidden border border-border transition-shadow hover:shadow-md">
                <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                  <Image
                    src={placeholder(300, 225, `${linea.slug}-p${i}`)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <CardHeader className="pb-1">
                  <h3 className="text-sm font-medium leading-tight text-foreground">
                    {name}
                  </h3>
                </CardHeader>
                <CardContent className="pt-0" />
              </Card>
            </li>
          ))}
        </ul>
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
