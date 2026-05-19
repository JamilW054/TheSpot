import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { CatalogProductViewerWithDesign } from "@/components/catalog/CatalogProductViewerWithDesign";
import { ProductReviews } from "@/components/catalog/ProductReviews";
import { getProductBySlug } from "@/lib/db";
import {
  getProductReviews,
  getUserReviewForProduct,
} from "@/lib/db/reviews";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [reviews, userExistingReview] = await Promise.all([
    getProductReviews(product.id),
    getUserReviewForProduct(product.id),
  ]);

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

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground mb-2">Tallas disponibles</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center justify-center rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-foreground"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

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
            </div>
          </div>

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

      <div className="mt-12 border-t border-border pt-8">
        <ProductReviews
          productId={product.id}
          productSlug={slug}
          reviews={reviews}
          currentUserId={user?.id ?? null}
          userExistingReview={userExistingReview}
        />
      </div>
    </article>
  );
}
