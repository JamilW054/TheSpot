import { ChevronRight, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AcceptedPayments } from "@/components/brand/AcceptedPayments";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { ProductPageEnter } from "@/components/catalog/ProductPageEnter";
import { ShareProductButton } from "@/components/catalog/ShareProductButton";
import { StickyBuyBar } from "@/components/catalog/StickyBuyBar";
import { WishlistButton } from "@/components/catalog/WishlistButton";
import { isComingSoonCategory, SITE_URL } from "@/config/brand";
import { FREE_SHIPPING_MIN_CENTS } from "@/config/shipping";
import { getProductBySlug } from "@/database/repositories";
import { getStockMatrixForProduct } from "@/database/repositories/inventory";
import { formatDOPFromCents } from "@/lib/format-currency";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto | The Spot" };
  return {
    title: `${product.name} | The Spot`,
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

  if (isComingSoonCategory(product.categorySlug)) {
    redirect(`/catalogo?categoria=${product.categorySlug}`);
  }

  const stock = await getStockMatrixForProduct(product.id);

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

  const gallery =
    product.gallery.length > 0
      ? product.gallery
      : [product.coverImage].filter(Boolean);

  return (
    <>
      <ProductPageEnter>
        <div className="min-h-screen pb-24 lg:pb-0">
          <div className="mx-auto max-w-6xl px-4 pt-6 pb-20 sm:px-6 lg:px-8">
            <nav
              data-enter="nav"
              aria-label="Breadcrumb"
              className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Link href="/" className="transition-colors hover:text-primary">
                Inicio
              </Link>
              <ChevronRight className="size-3 shrink-0" aria-hidden />
              <Link
                href="/catalogo"
                className="transition-colors hover:text-primary"
              >
                Catálogo
              </Link>
              {product.categorySlug && (
                <>
                  <ChevronRight className="size-3 shrink-0" aria-hidden />
                  <Link
                    href={`/catalogo?categoria=${product.categorySlug}`}
                    className="capitalize transition-colors hover:text-primary"
                  >
                    {product.categorySlug}
                  </Link>
                </>
              )}
              <ChevronRight className="size-3 shrink-0" aria-hidden />
              <span className="max-w-40 truncate font-medium text-foreground">
                {product.name}
              </span>
            </nav>

            <div className="grid items-start gap-8 lg:grid-cols-[1fr_420px] lg:gap-14">
              <div
                data-enter="gallery"
                className="lg:sticky lg:top-6 lg:self-start"
              >
                <ProductGallery images={gallery} name={product.name} />
              </div>

              <div
                data-enter="info"
                id="add-to-cart-section"
                className="flex min-w-0 flex-col gap-5 rounded-[1.75rem] border border-rose-100 bg-white p-5 sm:p-6"
              >
                <div className="flex items-center justify-between gap-2">
                  {product.brandName ? (
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                      {product.brandName}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold leading-none ${
                      isAvailable
                        ? "bg-emerald-50 text-emerald-700"
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

                <h1 className="text-2xl font-black leading-tight tracking-tight text-foreground sm:text-[1.85rem]">
                  {product.name}
                </h1>

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-4xl font-black leading-none text-primary tabular-nums">
                      {product.price}
                    </p>
                    {hasDiscount && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground line-through tabular-nums">
                          {product.originalPrice}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          Ahorras {savingsFormatted}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    {hasDiscount && (
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-black text-white tabular-nums">
                        -{discountPct}%
                      </span>
                    )}
                    <ShareProductButton
                      url={`${SITE_URL.replace(/\/$/, "")}/catalogo/${slug}`}
                      title={product.name}
                      size="md"
                      className="rounded-full border border-rose-200 bg-rose-50/60 hover:border-primary/50"
                    />
                    <WishlistButton
                      productId={product.id}
                      size="md"
                      className="rounded-full border border-rose-200 bg-rose-50/60 hover:border-primary/50"
                    />
                  </div>
                </div>

                <div className="h-px bg-rose-100" />

                <AddToCartButton
                  productId={product.id}
                  sizes={product.sizes}
                  colors={product.colors}
                  stockByKey={stock.stockByKey}
                  stockTracked={stock.tracked}
                  variant="primary"
                  className="w-full justify-center rounded-full py-3.5 text-[15px] font-bold"
                />

                <div className="divide-y divide-rose-100 overflow-hidden rounded-2xl border border-rose-100 bg-[#fff8f9]">
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
                    <AcceptedPayments label={null} />
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
                    <ShieldCheck
                      className="size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span>Devoluciones en 30 días</span>
                  </div>
                </div>

                {product.description && (
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                      Descripción
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                )}

                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/catalogo?etiqueta=${tag}`}
                        className="inline-flex items-center rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ProductPageEnter>

      <StickyBuyBar price={product.price} />
    </>
  );
}
