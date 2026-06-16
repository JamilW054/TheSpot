"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import type { CatalogProduct } from "@/types";
import { formatDateShort } from "@/lib/format-date";

function imageNeedsUnoptimized(src: string): boolean {
  return src.includes("placehold.co") || src.includes("unsplash.com");
}


function StarRow({ avg, count }: { avg: number; count: number }) {
  const full = Math.round(avg);
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-yellow-400 text-[11px] leading-none">
        {"★".repeat(full)}
        {"☆".repeat(5 - full)}
      </span>
      <span className="text-[10px] font-bold text-primary tabular-nums">
        {avg.toFixed(1)}
      </span>
      <span className="text-[10px] text-muted-foreground tabular-nums">
        ({count})
      </span>
    </div>
  );
}

export function WishlistCard({
  product,
  savedAt,
}: {
  product: CatalogProduct;
  savedAt?: string;
}) {
  const { addItem } = useCart();
  const { user, isLoading } = useAuth();
  const { toggleWishlist } = useWishlist();
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
    <article
      className="group/card relative flex overflow-hidden rounded-2xl bg-card transition-all duration-200"
      style={{
        minHeight: 148,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Image — full left panel, 38% width ── */}
      <div
        className="relative shrink-0 overflow-hidden bg-[#111116]"
        style={{ width: "38%" }}
      >
        {hasDiscount && (
          <span className="absolute left-2 top-2 z-10 rounded-[26px] bg-destructive px-2 py-0.5 text-[9px] font-bold text-white tabular-nums leading-none">
            -{discountPct}%
          </span>
        )}
        {product.coverImage ? (
          <Image
            src={product.coverImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover/card:scale-[1.04]"
            sizes="(max-width: 640px) 38vw, 280px"
            unoptimized={imageNeedsUnoptimized(product.coverImage)}
          />
        ) : (
          <div className="size-full" />
        )}
        {/* Soft right-side scrim so info panel edges cleanly */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-transparent to-card/30" />
      </div>

      {/* ── Info panel — right, pointer-events-none so overlay catches clicks ── */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 pointer-events-none min-w-0">
        {/* Top: brand + name + remove btn */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {product.brandName && (
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground mb-0.5">
                {product.brandName}
              </p>
            )}
            <h2 className="text-sm font-bold text-foreground leading-tight line-clamp-2">
              {product.name}
            </h2>
          </div>
          {/* Remove — pointer-events-auto overrides parent */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            aria-label="Quitar de favoritos"
            className="pointer-events-auto shrink-0 flex size-7 items-center justify-center rounded-md bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
          >
            <Trash2 className="size-3" aria-hidden />
          </button>
        </div>

        {/* Middle: rating */}
        {hasRating && (
          <StarRow avg={product.ratingAvg!} count={product.reviewCount} />
        )}

        {/* Bottom: price + date + CTA */}
        <div className="flex items-end justify-between gap-2 mt-auto pt-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-base font-black text-primary tabular-nums leading-none">
                {product.price}
              </span>
              {hasDiscount && (
                <span className="font-mono text-[11px] text-muted-foreground line-through tabular-nums">
                  {product.originalPrice}
                </span>
              )}
            </div>
            {savedAt && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Guardado el {formatDateShort(savedAt)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-[10px] bg-primary px-3 py-2 text-[11px] font-black text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            <ShoppingBag className="size-3 shrink-0" aria-hidden />
            {justAdded ? "¡Añadido!" : hasSizes ? "Comprar" : "Al carrito"}
          </button>
        </div>
      </div>

      {/* Accessible overlay link — z-5 */}
      <Link
        href={href}
        className="absolute inset-0 z-5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label={product.name}
      />
    </article>
  );
}
