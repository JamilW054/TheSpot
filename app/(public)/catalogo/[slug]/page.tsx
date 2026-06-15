import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { WishlistButton } from "@/components/catalog/WishlistButton";
import { ProductReviews } from "@/components/catalog/ProductReviews";
import { getProductBySlug } from "@/lib/db";
import { getProductReviews, getUserReviewForProduct } from "@/lib/db/reviews";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto | Buxxep" };
  return {
    title: `${product.name} | Buxxep`,
    description: product.description,
    openGraph: {
      images: product.coverImage ? [{ url: product.coverImage }] : [],
    },
  };
}

export default async function CatalogProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [reviews, userExistingReview] = await Promise.all([
    getProductReviews(product.id),
    getUserReviewForProduct(product.id),
  ]);

  const hasDiscount =
    product.originalPriceCents != null &&
    product.originalPriceCents > product.priceCents;

  const discountPct = hasDiscount
    ? Math.round(
        ((product.originalPriceCents! - product.priceCents) /
          product.originalPriceCents!) *
          100,
      )
    : 0;

  const gallery =
    product.gallery.length > 0 ? product.gallery : [product.coverImage].filter(Boolean);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 pt-6">

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <ChevronRight className="size-3 shrink-0" aria-hidden />
          <Link href="/catalogo" className="hover:text-foreground transition-colors">
            Catálogo
          </Link>
          {product.brandName && (
            <>
              <ChevronRight className="size-3 shrink-0" aria-hidden />
              <span className="text-foreground font-medium">{product.brandName}</span>
            </>
          )}
          <ChevronRight className="size-3 shrink-0" aria-hidden />
          <span className="text-foreground font-medium truncate max-w-[160px]">{product.name}</span>
        </nav>

        {/* ── Main grid ── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:gap-12 lg:items-start">

          {/* Left — Gallery */}
          <ProductGallery images={gallery} name={product.name} />

          {/* Right — Info sticky */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24">

            {/* Brand + name */}
            <div>
              {product.brandName && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                  {product.brandName}
                </p>
              )}
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                {product.name}
              </h1>
            </div>

            {/* Pricing */}
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold tracking-tight text-foreground">
                {product.price}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {product.originalPrice}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Sizes + Add to cart */}
            <div className="flex gap-3">
              <AddToCartButton
                productId={product.id}
                sizes={product.sizes}
                variant="primary"
                className="flex-1 justify-center rounded-xl py-3.5 text-[15px] font-semibold"
              />
              <WishlistButton
                productId={product.id}
                size="md"
                className="size-13 rounded-xl border border-border/60 bg-muted/30 hover:border-primary/50 shrink-0"
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Perks */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="size-4 shrink-0 text-primary" aria-hidden />
                <span>Envío gratis en pedidos superiores a DOP 3,000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
                <span>Pago seguro · Devoluciones en 30 días</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <>
                <div className="h-px bg-border" />
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    Descripción
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                </div>
              </>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/catalogo?etiqueta=${tag}`}
                    className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="mt-16 border-t border-border pt-10">
          <ProductReviews
            productId={product.id}
            productSlug={slug}
            reviews={reviews}
            currentUserId={user?.id ?? null}
            userExistingReview={userExistingReview}
          />
        </div>
      </div>
    </div>
  );
}
