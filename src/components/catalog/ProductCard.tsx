"use client";

import { Check, Heart, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import type { CatalogProduct } from "@/types";

function imageNeedsUnoptimized(src: string): boolean {
  return src.includes("placehold.co") || src.includes("unsplash.com");
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
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

  const needsProductPage = product.colors.length > 0;
  const href = `/catalogo/${product.slug}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // El color sigue siendo obligatorio en ficha; el tamaño/talla es opcional.
    if (needsProductPage) {
      router.push(href);
      return;
    }
    addItem(product.id, 1, product.sizes[0] ?? null, null);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <article className="group/card relative flex flex-col overflow-hidden rounded-[1.5rem] border border-rose-100 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_16px_32px_-18px_rgba(225,29,72,0.4)]">
      <Link
        href={href}
        className="relative block overflow-hidden bg-rose-50"
        style={{ aspectRatio: "4/5" }}
        tabIndex={-1}
        aria-hidden
      >
        {hasDiscount && (
          <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-primary px-2.5 py-1 text-[11px] font-black leading-none text-white tabular-nums shadow-sm">
            -{discountPct}%
          </span>
        )}

        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover/card:scale-[1.05]"
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 320px"
            unoptimized={imageNeedsUnoptimized(product.coverImage)}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            Sin imagen
          </div>
        )}
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
        className={`absolute right-2.5 top-2.5 z-10 flex size-8 items-center justify-center rounded-full backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          saved
            ? "bg-white text-primary"
            : "bg-white/85 text-muted-foreground hover:bg-white hover:text-primary"
        }`}
      >
        <Heart
          className="size-3.5"
          fill={saved ? "currentColor" : "none"}
          stroke={saved ? "none" : "currentColor"}
          aria-hidden
        />
      </button>

      <Link
        href={href}
        className="flex flex-col gap-1.5 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
        aria-label={product.name}
      >
        {product.brandName ? (
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {product.brandName}
          </p>
        ) : null}
        <h2 className="line-clamp-2 min-h-9 text-[13px] font-semibold leading-snug text-foreground">
          {product.name}
        </h2>

        <div className="mt-0.5 flex items-end justify-between gap-2">
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
            className={`flex size-8 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              justAdded
                ? "border-primary bg-primary text-white"
                : "border-rose-200 bg-white text-foreground hover:border-primary hover:bg-primary hover:text-white"
            }`}
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
