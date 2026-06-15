"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { WishlistButton } from "./WishlistButton";
import type { CatalogProduct } from "@/types";

interface ProductCardProps {
  product: CatalogProduct;
}

function imageNeedsUnoptimized(src: string): boolean {
  return src.includes("placehold.co") || src.includes("unsplash.com");
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [justAdded, setJustAdded] = useState(false);

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

  const hasSizes = product.sizes.length > 0;
  const previewSizes = product.sizes.slice(0, 4);
  const extraSizes = product.sizes.length - 4;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoading && !user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (hasSizes) {
      router.push(`/catalogo/${product.slug}`);
      return;
    }
    addItem(product.id, 1, null, null);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <article className="group/card flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111116] transition-all duration-300 hover:border-primary/30 hover:shadow-[0_16px_48px_-16px_rgba(60,200,247,0.18)]">

      {/* Image area */}
      <Link
        href={`/catalogo/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-gradient-to-br from-[#1c1c24] to-[#0e0e13]"
      >
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(60,200,247,0.08),transparent_70%)]" aria-hidden />

        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            className="object-contain object-center p-4 transition-transform duration-500 group-hover/card:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized={imageNeedsUnoptimized(product.coverImage)}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
            -{discountPct}%
          </span>
        )}

        {/* Wishlist */}
        <div className="absolute right-2.5 top-2.5">
          <WishlistButton productId={product.id} size="sm" />
        </div>
      </Link>

      {/* Info area */}
      <div className="flex flex-col gap-2 p-3">
        {/* Brand */}
        {product.brandName && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/80">
            {product.brandName}
          </p>
        )}

        {/* Name */}
        <h2 className="text-sm font-bold leading-snug text-foreground line-clamp-2 group-hover/card:text-primary transition-colors">
          <Link href={`/catalogo/${product.slug}`}>
            {product.name}
          </Link>
        </h2>

        {/* Sizes */}
        {hasSizes && (
          <div className="flex flex-wrap gap-1">
            {previewSizes.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {s}
              </span>
            ))}
            {extraSizes > 0 && (
              <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                +{extraSizes}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-foreground">
            {product.price}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-0.5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ShoppingCart className="size-3.5" aria-hidden />
          {justAdded ? "¡Añadido!" : hasSizes ? "Ver tallas" : "Añadir"}
        </button>
      </div>
    </article>
  );
}
