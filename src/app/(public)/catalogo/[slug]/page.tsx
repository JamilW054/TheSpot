import { ChevronRight, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { ProductPageEnter } from "@/components/catalog/ProductPageEnter";
import { ProductReviews } from "@/components/catalog/ProductReviews";
import { ShareProductButton } from "@/components/catalog/ShareProductButton";
import { StickyBuyBar } from "@/components/catalog/StickyBuyBar";
import { WishlistButton } from "@/components/catalog/WishlistButton";
import { FREE_SHIPPING_MIN_CENTS } from "@/config/shipping";
import { getProductBySlug } from "@/database/repositories";
import { getStockMatrixForProduct } from "@/database/repositories/inventory";
import {
  getProductReviews,
  getUserReviewForProduct,
} from "@/database/repositories/reviews";
import { formatDOPFromCents } from "@/lib/format-currency";
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

  const [reviews, userExistingReview, stock] = await Promise.all([
    getProductReviews(product.id),
    getUserReviewForProduct(product.id),
    getStockMatrixForProduct(product.id),
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

  const savingsFormatted = hasDiscount
    ? formatDOPFromCents(product.originalPriceCents! - product.priceCents)
    : "";

  const isAvailable = !stock.tracked || stock.totalStock > 0;

  const hasRating = product.ratingAvg != null && product.reviewCount > 0;
  const ratingFull = hasRating ? Math.round(product.ratingAvg!) : 0;

  const gallery =
    product.gallery.length > 0
      ? product.gallery
      : [product.coverImage].filter(Boolean);

  return (
    <>
      <ProductPageEnter>
        <div className="min-h-screen pb-24 lg:pb-0">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-20">
            {/* Breadcrumb */}
            <nav
              data-enter="nav"
              aria-label="Breadcrumb"
              className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Inicio
              </Link>
              <ChevronRight className="size-3 shrink-0" aria-hidden />
              <Link
                href="/catalogo"
                className="hover:text-foreground transition-colors"
              >
                Catálogo
              </Link>
              {product.brandName && (
                <>
                  <ChevronRight className="size-3 shrink-0" aria-hidden />
                  <span>{product.brandName}</span>
                </>
              )}
              <ChevronRight className="size-3 shrink-0" aria-hidden />
              <span className="truncate max-w-40 text-foreground font-medium">
                {product.name}
              </span>
            </nav>

            {/* ── Main grid ── */}
            <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-14 lg:items-start">
              {/* LEFT — Gallery, sticky on desktop */}
              <div
                data-enter="gallery"
                className="lg:sticky lg:top-6 lg:self-start"
              >
                <ProductGallery images={gallery} name={product.name} />
              </div>

              {/* RIGHT — Info panel, scrolls naturally with the page */}
              <div
                data-enter="info"
                id="add-to-cart-section"
                className="flex flex-col gap-5 min-w-0"
              >
                {/* Brand + availability badge */}
                <div className="flex items-center justify-between gap-2">
                  {product.brandName ? (
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                      {product.brandName}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold leading-none ${
                      isAvailable
                        ? "bg-green-500/15 text-green-400"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    <span
                      className="size-1.5 rounded-full bg-current"
                      aria-hidden
                    />
                    {isAvailable ? "Disponible" : "Agotado"}
                  </span>
                </div>

                {/* Product name */}
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-[1.75rem]">
                  {product.name}
                </h1>

                {/* Stars + review count link */}
                {hasRating && (
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm leading-none">
                      {"★".repeat(ratingFull)}
                      {"☆".repeat(5 - ratingFull)}
                    </span>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {product.ratingAvg!.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground/60 text-sm">·</span>
                    <a
                      href="#reviews"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-2"
                    >
                      {product.reviewCount}{" "}
                      {product.reviewCount === 1 ? "reseña" : "reseñas"}
                    </a>
                  </div>
                )}

                {/* Price + discount + wishlist */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-mono text-4xl font-black text-primary tabular-nums leading-none">
                      {product.price}
                    </p>
                    {hasDiscount && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground line-through tabular-nums">
                          {product.originalPrice}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-green-500/15 px-2.5 py-0.5 text-[11px] font-bold text-green-400">
                          Ahorras {savingsFormatted}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {hasDiscount && (
                      <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-black text-destructive tabular-nums">
                        -{discountPct}%
                      </span>
                    )}
                    <ShareProductButton
                      url={`${(process.env.NEXT_PUBLIC_SITE_URL ?? "https://buxxep.com").replace(/\/$/, "")}/catalogo/${slug}`}
                      title={product.name}
                      size="md"
                      className="rounded-xl border border-border/60 bg-muted/30 hover:border-primary/50"
                    />
                    <WishlistButton
                      productId={product.id}
                      size="md"
                      className="rounded-xl border border-border/60 bg-muted/30 hover:border-primary/50"
                    />
                  </div>
                </div>

                <div className="h-px bg-border/60" />

                {/* Sizes + Quantity + Add to cart */}
                <AddToCartButton
                  productId={product.id}
                  sizes={product.sizes}
                  colors={product.colors}
                  stockByKey={stock.stockByKey}
                  stockTracked={stock.tracked}
                  variant="primary"
                  className="w-full justify-center rounded-xl py-3.5 text-[15px] font-semibold"
                />

                {/* Perks card */}
                <div className="divide-y divide-border/50 rounded-xl border border-border/50 bg-muted/20">
                  <div className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
                    <Truck
                      className="size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span>
                      Envío gratis en pedidos desde{" "}
                      {formatDOPFromCents(FREE_SHIPPING_MIN_CENTS)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
                    <ShieldCheck
                      className="size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span>Pago seguro · Devoluciones en 30 días</span>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Descripción
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
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

            {/* ── Reviews — full width, below the grid, no inner scroll ── */}
            <section
              id="reviews"
              className="mt-14 border-t border-border/60 pt-12"
            >
              <ProductReviews
                productId={product.id}
                productSlug={slug}
                reviews={reviews}
                currentUserId={user?.id ?? null}
                userExistingReview={userExistingReview}
              />
            </section>
          </div>
        </div>
      </ProductPageEnter>

      <StickyBuyBar price={product.price} />
    </>
  );
}
