"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CatalogProduct } from "@/types";

function imageNeedsUnoptimized(src: string): boolean {
  return src.includes("placehold.co") || src.includes("unsplash.com");
}

function Stars({ avg, count, light = false }: { avg: number; count: number; light?: boolean }) {
  const full = Math.round(avg);
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-[10px] leading-none ${light ? "text-yellow-300" : "text-yellow-400"}`}>
        {"★".repeat(full)}{"☆".repeat(5 - full)}
      </span>
      <span className={`text-[10px] font-bold tabular-nums ${light ? "text-white/80" : "text-foreground"}`}>
        {avg.toFixed(1)}
      </span>
      <span className={`text-[10px] tabular-nums ${light ? "text-white/40" : "text-muted-foreground"}`}>
        ({count})
      </span>
    </div>
  );
}

function WishlistBtn({ productId, light = false }: { productId: string; light?: boolean }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const saved = isInWishlist(productId);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(productId); }}
      aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`z-20 flex size-8 items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        light
          ? "bg-white/90 text-primary shadow-sm backdrop-blur-sm hover:bg-white hover:text-primary"
          : "bg-white text-muted-foreground shadow-sm hover:text-primary"
      }`}
    >
      <Heart
        className="size-3.5"
        fill={saved ? "currentColor" : "none"}
        stroke={saved ? "none" : "currentColor"}
        aria-hidden
      />
    </button>
  );
}

interface CardProps {
  product: CatalogProduct;
  variant?: "default" | "hero" | "wide" | "fill";
}

export function LandingProductCard({ product, variant = "default" }: CardProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);

  const hasDiscount = product.originalPriceCents != null && product.originalPriceCents > product.priceCents;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPriceCents! - product.priceCents) / product.originalPriceCents!) * 100)
    : 0;
  const hasSizes = product.sizes.length > 0;
  const needsProductPage = product.colors.length > 0;
  const hasRating = product.ratingAvg != null && product.reviewCount > 0;
  const href = `/catalogo/${product.slug}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (needsProductPage) {
      router.push(href);
      return;
    }
    addItem(product.id, 1, product.sizes[0] ?? null, null);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  /* ─── DEFAULT variant: image-on-top + info panel below ─────────────────── */
  if (variant === "default") {
    return (
      <article
        className="group/card relative flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:shadow-[0_0_0_1.5px_rgba(220,38,38,0.2),0_12px_40px_-12px_rgba(0,0,0,0.6)]"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
          {product.coverImage ? (
            <Image
              src={product.coverImage}
              alt={product.name}
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover/card:scale-[1.06]"
              sizes="(max-width: 520px) 50vw, (max-width: 1024px) 33vw, 22vw"
              unoptimized={imageNeedsUnoptimized(product.coverImage)}
            />
          ) : (
            <div className="absolute inset-0 bg-rose-50" />
          )}

          {/* Badges */}
          {hasDiscount && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-destructive px-2.5 py-0.5 text-[10px] font-black text-white tabular-nums">
              -{discountPct}%
            </span>
          )}
          <div className="absolute right-2 top-2 z-10">
            <WishlistBtn productId={product.id} />
          </div>
        </div>

        {/* Info panel — relative z-10 so it sits above the z-5 full-card Link */}
        <div className="relative z-10 flex flex-col gap-2 p-3 pointer-events-none">
          {product.brandName && (
            <p className="text-[9px] font-black uppercase tracking-[0.26em] text-muted-foreground leading-none">
              {product.brandName}
            </p>
          )}
          <h2 className="text-[13px] font-bold text-foreground leading-tight line-clamp-2 sm:text-sm">
            {product.name}
          </h2>
          {hasRating && <Stars avg={product.ratingAvg!} count={product.reviewCount} />}

          <div className="flex items-end justify-between gap-2 pt-0.5">
            {/* Prices stacked so they never overflow on narrow columns */}
            <div className="min-w-0">
              <p className="font-mono text-sm font-black text-primary tabular-nums leading-none">
                {product.price}
              </p>
              {hasDiscount && (
                <p className="font-mono mt-0.5 text-[10px] text-muted-foreground line-through tabular-nums">
                  {product.originalPrice}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="pointer-events-auto hidden sm:flex shrink-0 items-center gap-1 rounded-xl bg-primary px-3 py-2 text-[11px] font-black text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              <ShoppingBag className="size-3 shrink-0" aria-hidden />
              {justAdded ? "¡Listo!" : hasSizes ? "Ver" : "Añadir"}
            </button>
          </div>
        </div>

        <Link
          href={href}
          className="absolute inset-0 z-5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label={product.name}
        />
      </article>
    );
  }

  /* ─── FILL variant: flex-col, image fills flex-1, info panel at bottom ─── */
  if (variant === "fill") {
    return (
      <article
        className="group/card relative flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:shadow-[0_0_0_1.5px_rgba(220,38,38,0.2),0_12px_40px_-12px_rgba(0,0,0,0.6)]"
        style={{ height: "100%", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
      >
        {/* Image grows to fill available height */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {product.coverImage ? (
            <Image
              src={product.coverImage}
              alt={product.name}
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover/card:scale-[1.06]"
              sizes="(max-width: 1024px) 50vw, 25vw"
              unoptimized={imageNeedsUnoptimized(product.coverImage)}
            />
          ) : (
            <div className="absolute inset-0 bg-rose-50" />
          )}

          {hasDiscount && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-destructive px-2.5 py-0.5 text-[10px] font-black text-white tabular-nums">
              -{discountPct}%
            </span>
          )}
          <div className="absolute right-2 top-2 z-10">
            <WishlistBtn productId={product.id} />
          </div>
        </div>

        {/* Info panel — fixed at bottom; relative z-10 so button is above the z-5 Link */}
        <div className="relative z-10 shrink-0 flex flex-col gap-1.5 p-3 pointer-events-none border-t border-border/40">
          {product.brandName && (
            <p className="text-[9px] font-black uppercase tracking-[0.26em] text-muted-foreground leading-none">
              {product.brandName}
            </p>
          )}
          <h2 className="text-[12px] font-bold text-foreground leading-tight line-clamp-1">
            {product.name}
          </h2>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-black text-primary tabular-nums leading-none">
              {product.price}
            </span>
            <button
              type="button"
              onClick={handleAddToCart}
              className="pointer-events-auto flex shrink-0 items-center gap-1 rounded-xl bg-primary px-2.5 py-1.5 text-[10px] font-black text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              <ShoppingBag className="size-3 shrink-0" aria-hidden />
              {justAdded ? "¡Listo!" : hasSizes ? "Ver" : "Añadir"}
            </button>
          </div>
        </div>

        <Link
          href={href}
          className="absolute inset-0 z-5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label={product.name}
        />
      </article>
    );
  }

  /* ─── WIDE variant: landscape ───────────────────────────────────────────── */
  if (variant === "wide") {
    return (
      <article
        className="group/card relative flex overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:shadow-[0_0_0_1.5px_rgba(220,38,38,0.2),0_12px_40px_-12px_rgba(0,0,0,0.5)]"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
      >
        {/* Image — left 40% */}
        <div className="relative shrink-0 overflow-hidden" style={{ width: "40%", minHeight: 192 }}>
          {product.coverImage ? (
            <Image
              src={product.coverImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.06]"
              sizes="(max-width: 640px) 40vw, 30vw"
              unoptimized={imageNeedsUnoptimized(product.coverImage)}
            />
          ) : (
            <div className="size-full bg-rose-50" />
          )}
          <div className="absolute inset-0 bg-linear-to-r from-transparent to-card/40" />
          {hasDiscount && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-destructive px-2.5 py-0.5 text-[10px] font-black text-white tabular-nums">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Info — right; relative z-10 so button is above the z-5 Link */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-4 sm:p-5 pointer-events-none min-w-0">
          <div className="space-y-1.5">
            {product.brandName && (
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-muted-foreground">
                {product.brandName}
              </p>
            )}
            <h2 className="text-base font-bold text-foreground leading-tight line-clamp-1 sm:text-lg">
              {product.name}
            </h2>
            {hasRating && <Stars avg={product.ratingAvg!} count={product.reviewCount} />}
            {hasSizes && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {product.sizes.slice(0, 5).map((s) => (
                  <span key={s} className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                    {s}
                  </span>
                ))}
                {product.sizes.length > 5 && (
                  <span className="rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                    +{product.sizes.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between gap-4 pt-3 mt-2 border-t border-border/40">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Precio</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-lg font-black text-primary tabular-nums">{product.price}</span>
                {hasDiscount && (
                  <span className="font-mono text-xs text-muted-foreground line-through tabular-nums">{product.originalPrice}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground transition-all hover:opacity-90 active:scale-95"
            >
              <ShoppingBag className="size-3.5 shrink-0" aria-hidden />
              {justAdded ? "¡Añadido!" : hasSizes ? "Comprar" : "Al carrito"}
            </button>
          </div>
        </div>

        <Link
          href={href}
          className="absolute inset-0 z-5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label={product.name}
        />
        <div className="absolute right-3 top-3 z-20">
          <WishlistBtn productId={product.id} light />
        </div>
      </article>
    );
  }

  /* ─── HERO variant: tall full-bleed editorial card ──────────────────────── */
  return (
    <article
      className="group/card relative overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:shadow-[0_0_0_1.5px_rgba(220,38,38,0.22),0_24px_64px_-20px_rgba(220,38,38,0.1)]"
      style={{ height: "100%" }}
    >
      {/* Image */}
      {product.coverImage ? (
        <Image
          src={product.coverImage}
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-700 ease-out group-hover/card:scale-[1.06]"
          sizes="(max-width: 640px) 100vw, 42vw"
          unoptimized={imageNeedsUnoptimized(product.coverImage)}
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-rose-50" />
      )}

      {/* Gradient scrims */}
      <div className="absolute inset-0 bg-linear-to-t from-white via-white/40 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-white/80 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-primary/[0.04] to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-5 pointer-events-none">
        {product.brandName && (
          <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-primary/80">
            <span className="size-1 rounded-full bg-primary/80 shrink-0" />
            {product.brandName}
          </p>
        )}
        <h2 className="text-xl font-black text-white leading-tight sm:text-2xl line-clamp-2">
          {product.name}
        </h2>
        {hasRating && <Stars avg={product.ratingAvg!} count={product.reviewCount} light />}

        {hasSizes && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {product.sizes.slice(0, 6).map((s) => (
              <span key={s} className="rounded border border-white/15 bg-white/[0.07] px-1.5 py-0.5 text-[9px] text-white/55 font-semibold">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="mt-1 h-px bg-white/10" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-primary tabular-nums">{product.price}</span>
            {hasDiscount && (
              <span className="font-mono text-sm text-white/35 line-through tabular-nums">{product.originalPrice}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            <ShoppingBag className="size-3.5 shrink-0" aria-hidden />
            {justAdded ? "¡Añadido!" : hasSizes ? "Comprar" : "Al carrito"}
          </button>
        </div>
      </div>

      {/* Full-card link */}
      <Link
        href={href}
        className="absolute inset-0 z-5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
        aria-label={product.name}
      />

      {/* Top badges */}
      {hasDiscount && (
        <span className="absolute left-3 top-3 z-20 rounded-full bg-destructive px-2.5 py-0.5 text-[10px] font-black text-white tabular-nums">
          -{discountPct}%
        </span>
      )}
      <div className="absolute right-3 top-3 z-20">
        <WishlistBtn productId={product.id} light />
      </div>
    </article>
  );
}
