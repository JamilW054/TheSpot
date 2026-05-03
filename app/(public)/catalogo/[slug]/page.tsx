import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminEditorLink } from "@/components/auth";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { CatalogProductViewerWithDesign } from "@/components/catalog/CatalogProductViewerWithDesign";
import { getProductBySlug } from "@/lib/db";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto | Buxxep" };
  return {
    title: `${product.name} | Catálogo Buxxep`,
    description: product.description,
  };
}

/** placehold.co suele servir SVG; el resto (R2, Supabase, etc.) pasa por optimización de `next/image`. */
function imageNeedsUnoptimized(src: string): boolean {
  return src.includes("placehold.co");
}

export default async function CatalogProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const editorHref = `/editor?product=${product.id}`;

  return (
    <article className="min-h-0 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 pt-4 sm:pt-6">
      <nav className="mb-4 sm:mb-6" aria-label="Navegación">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className="size-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-label="Volver al catálogo"
          >
            <title>Volver al catálogo</title>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Catálogo
        </Link>
      </nav>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
        <section className="space-y-4 min-w-0" aria-label="Vista del producto">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-sm">
            <Image
              src={product.coverImage}
              alt={product.name}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized={imageNeedsUnoptimized(product.coverImage)}
            />
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 overflow-hidden">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
              Vista previa
            </p>
            <div className="aspect-square min-h-[240px] sm:min-h-[300px] w-full">
              <CatalogProductViewerWithDesign
                product={product}
                design={null}
                compact
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col min-w-0 lg:sticky lg:top-24">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            {product.name}
          </h1>
          <p className="mt-2 text-xl font-semibold text-primary sm:text-2xl">
            {product.price}
          </p>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
            {product.description}
          </p>

          <div className="mt-6 sm:mt-8 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/20">
              <span className="text-sm font-medium text-foreground">
                Acciones
              </span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <AddToCartButton
                productId={product.id}
                variant="primary"
                className="w-full justify-center rounded-xl py-3.5 text-base font-medium"
              />
              <AdminEditorLink
                href={editorHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary/40 bg-primary/5 py-3 text-sm font-medium text-foreground hover:bg-primary/10 hover:border-primary/60 transition-colors"
              >
                <svg
                  className="size-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-label="Icono diseñar"
                >
                  <title>Diseñar</title>
                  <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Diseñar
              </AdminEditorLink>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Los administradores pueden abrir el editor para personalizar la
            prenda; los demás usuarios compran desde el carrito.
          </p>

          <Link
            href="/catalogo"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-label="Ver todos los productos"
            >
              <title>Ver todos los productos</title>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Ver todos los productos
          </Link>
        </section>
      </div>
    </article>
  );
}
