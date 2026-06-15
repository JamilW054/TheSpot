"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { useWishlist } from "@/contexts/wishlist-context";
import type { CatalogProduct } from "@/types";

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = [...wishlistIds];
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/wishlist-products?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data: CatalogProduct[]) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 pb-20 pt-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Mis favoritos
        </h1>
        {!loading && (
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length === 0
              ? "No has guardado ningún producto todavía."
              : `${products.length} ${products.length === 1 ? "producto guardado" : "productos guardados"}`}
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted/40">
            <Heart className="size-7 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              Aún no tienes favoritos
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Guarda productos con el corazón para encontrarlos aquí.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="mt-2 inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
