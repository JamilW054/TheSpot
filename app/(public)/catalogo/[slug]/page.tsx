import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { CatalogProductViewer } from "@/components/catalog/CatalogProductViewer";
import { MOCK_CATALOG_PRODUCTS } from "@/config/mock-data";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function findProduct(slug: string) {
  return MOCK_CATALOG_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return { title: "Producto | Buxxep" };
  return {
    title: `${product.name} | Catálogo Buxxep`,
    description: product.description,
  };
}

export default async function CatalogProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product) {
    notFound();
  }

  const personalizarHref = product.defaultDesignId
    ? `/editor?copy=${product.defaultDesignId}&product=${product.id}`
    : `/editor?product=${product.id}`;
  const diseñarHref = `/editor?product=${product.id}`;

  return (
    <article className="min-h-[80vh]">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Galería: imagen + 3D */}
        <section className="space-y-4" aria-label="Vista del producto">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
            <Image
              src={product.coverImage}
              alt=""
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">Vista 3D</h2>
            <CatalogProductViewer modelPath={product.modelPath} />
          </div>
        </section>

        {/* Info + CTAs */}
        <section className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl font-semibold text-primary">{product.price}</p>
          <p className="mt-4 text-muted-foreground">{product.description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <AddToCartButton
              productId={product.id}
              variant="primary"
              className="px-6 py-3 text-base"
            />
            <Link
              href={personalizarHref}
              className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-transparent px-6 py-3 text-base font-medium hover:bg-muted"
            >
              {product.defaultDesignId
                ? "Personalizar con plantilla (crea una copia)"
                : "Diseñar en el editor"}
            </Link>
            <Link
              href={diseñarHref}
              className="inline-flex items-center justify-center rounded-xl border-2 border-border bg-transparent px-6 py-3 text-base font-medium hover:bg-muted"
            >
              Diseñar desde cero
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Al hacer clic en &quot;Personalizar con plantilla&quot; se crea una copia del diseño en tu sesión para que
            puedas editarlo sin modificar el original. Usa el editor para texto, formas, imágenes y pincel sobre la
            prenda 3D.
          </p>

          <Link
            href="/catalogo"
            className="mt-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Volver al catálogo
          </Link>
        </section>
      </div>
    </article>
  );
}
