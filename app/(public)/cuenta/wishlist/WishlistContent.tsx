"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/wishlist-context";
import type { CatalogProduct } from "@/types";

function isExternalImage(src: string) {
  return src.startsWith("http") || src.includes("placehold.co");
}

export function WishlistContent({
  allProducts,
}: {
  allProducts: CatalogProduct[];
}) {
  const { wishlistIds, toggleWishlist } = useWishlist();

  const items = allProducts.filter((p) => wishlistIds.has(p.id));

  if (items.length === 0) {
    return (
      <div className="animate-scale-in rounded-[14px] border border-border bg-card p-14 text-center">
        <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-muted/60">
          <Heart className="size-9 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Tu lista está vacía
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
          Guarda los productos que te gusten para encontrarlos fácilmente
          después.
        </p>
        <Link
          href="/catalogo"
          className="mt-7 inline-flex items-center justify-center rounded-[10px] bg-primary px-7 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 animate-stagger">
      {items.map((product) => (
        <div
          key={product.id}
          className="group relative flex flex-col overflow-hidden rounded-[14px] border border-border bg-card transition-[border-color] hover:border-primary/30"
        >
          {/* Image */}
          <Link
            href={`/catalogo/${product.slug}`}
            className="relative aspect-square overflow-hidden bg-muted"
          >
            <Image
              src={product.coverImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 33vw"
              unoptimized={isExternalImage(product.coverImage)}
            />
          </Link>

          {/* Wishlist remove btn */}
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-destructive backdrop-blur-sm transition-transform hover:scale-110"
            aria-label="Quitar de favoritos"
          >
            <Heart className="size-4 fill-destructive" aria-hidden />
          </button>

          {/* Info */}
          <div className="flex flex-col gap-1 border-t border-border/60 p-3">
            {product.brandName ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {product.brandName}
              </span>
            ) : null}
            <Link
              href={`/catalogo/${product.slug}`}
              className="line-clamp-2 text-xs font-semibold leading-tight text-foreground transition-colors hover:text-primary sm:text-sm"
            >
              {product.name}
            </Link>
            <span className="font-mono text-sm font-bold text-primary tabular-nums">
              {product.price}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
