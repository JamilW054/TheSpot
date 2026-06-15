"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Heart } from "lucide-react";
import type { CatalogProduct } from "@/types";

function imageNeedsUnoptimized(src: string): boolean {
  return src.includes("placehold.co") || src.includes("unsplash.com");
}

function StarRow({ avg, count }: { avg: number; count: number }) {
  const full = Math.round(avg);
  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400 text-[11px] leading-none">
        {"★".repeat(full)}
        {"☆".repeat(5 - full)}
      </span>
      <span className="text-[10px] font-semibold text-primary tabular-nums">
        {avg.toFixed(1)}
      </span>
      <span className="text-[10px] text-muted-foreground tabular-nums">
        ({count})
      </span>
    </div>
  );
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  const { user, isLoading } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const [justAdded, setJustAdded] = useState(false);

  const saved = isInWishlist(product.id);

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
  const hasRating = product.ratingAvg != null && product.reviewCount > 0;

  const href = `/catalogo/${product.slug}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && !user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (hasSizes) {
      router.push(href);
      return;
    }
    addItem(product.id, 1, null, null);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <article className="group/card relative flex flex-col overflow-hidden rounded-[14px] border border-border bg-card transition-all duration-300 hover:border-primary/40">

      {/* ── Image area ── */}
      <Link
        href={href}
        className="relative block overflow-hidden bg-[#111116]"
        style={{ aspectRatio: "3/4" }}
        tabIndex={-1}
        aria-hidden
      >
        {/* Discount badge — red */}
        {hasDiscount && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-[26px] bg-destructive px-2 py-0.5 text-[10px] font-bold text-white tabular-nums">
            -{discountPct}%
          </span>
        )}

        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover/card:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            unoptimized={imageNeedsUnoptimized(product.coverImage)}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}
      </Link>

      {/* Wishlist button — absolute over image */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
        className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-card/80 text-muted-foreground backdrop-blur-sm transition-all hover:bg-card hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <Heart
          className="size-3.5"
          fill={saved ? "currentColor" : "none"}
          stroke={saved ? "none" : "currentColor"}
          aria-hidden
        />
      </button>

      {/* ── Info panel ── */}
      <Link
        href={href}
        className="flex flex-col gap-1.5 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
        aria-label={product.name}
      >
        {/* Brand */}
        {product.brandName && (
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            {product.brandName}
          </p>
        )}

        {/* Name */}
        <h2 className="text-[13px] font-semibold leading-snug text-foreground line-clamp-1">
          {product.name}
        </h2>

        {/* Rating */}
        {hasRating && (
          <StarRow avg={product.ratingAvg!} count={product.reviewCount} />
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-black text-primary tabular-nums">
            {product.price}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-muted-foreground line-through tabular-nums">
              {product.originalPrice}
            </span>
          )}
        </div>

        {/* Sizes */}
        {hasSizes && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {previewSizes.map((s) => (
              <span
                key={s}
                className="rounded-md border border-border bg-muted/30 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground"
              >
                {s}
              </span>
            ))}
            {extraSizes > 0 && (
              <span className="rounded-md border border-border bg-muted/30 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                +{extraSizes}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-primary py-2 text-[11px] font-black text-primary-foreground transition-all duration-200 opacity-0 translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-y-0 hover:opacity-90 active:scale-95"
        >
          <ShoppingBag className="size-3 shrink-0" aria-hidden />
          {justAdded ? "¡Añadido!" : hasSizes ? "Comprar" : "Al carrito"}
        </button>
      </Link>
    </article>
  );
}
