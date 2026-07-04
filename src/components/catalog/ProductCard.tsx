"use client";

import { Check, Heart, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useAuth } from "@/lib/auth-context";
import type { CatalogProduct } from "@/types";

function imageNeedsUnoptimized(src: string): boolean {
  return src.includes("placehold.co") || src.includes("unsplash.com");
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
    <article className="group/card relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition duration-200 hover:border-foreground/20 hover:shadow-[0_10px_28px_-16px_rgba(0,0,0,0.4)]">

      {/* ── Image area (más cuadrada) ── */}
      <Link
        href={href}
        className="relative block overflow-hidden bg-[#f4f4f5] dark:bg-[#111116]"
        style={{ aspectRatio: "4/5" }}
        tabIndex={-1}
        aria-hidden
      >
        {/* Discount badge — grande y muy visible */}
        {hasDiscount && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-destructive px-2 py-1 text-[13px] font-bold leading-none text-white tabular-nums shadow-sm">
            -{discountPct}%
          </span>
        )}

        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover/card:scale-[1.05]"
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

      {/* ── Info panel — solo nombre + precio ── */}
      <Link
        href={href}
        className="flex flex-col gap-1.5 p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
        aria-label={product.name}
      >
        {/* Name */}
        <h2 className="text-[13px] font-medium leading-snug text-foreground line-clamp-1">
          {product.name}
        </h2>

        {/* Price + cart — precio anterior arriba del precio base */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex min-w-0 flex-col leading-none">
            {hasDiscount && (
              <span className="font-mono text-[11px] text-muted-foreground line-through tabular-nums">
                {product.originalPrice}
              </span>
            )}
            <span className="mt-0.5 font-mono text-base font-black text-primary tabular-nums">
              {product.price}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={justAdded ? "Añadido al carrito" : "Añadir al carrito"}
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {justAdded ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Plus className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </Link>
    </article>
  );
}
