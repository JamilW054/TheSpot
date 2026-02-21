"use client";

import { useCart } from "@/contexts/cart-context";
import type { CatalogProduct } from "@/types";
import Image from "next/image";
import Link from "next/link";

export function CartContent({ products }: { products: CatalogProduct[] }) {
  const { items, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">Tu carrito está vacío.</p>
        <Link
          href="/catalogo"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  let totalCents = 0;

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
        {items.map((item) => {
          const product = productMap.get(item.productId);
          if (!product) return null;
          const lineTotal = product.priceCents * item.quantity;
          totalCents += lineTotal;
          return (
            <li key={`${item.productId}:${item.designId ?? ""}`} className="flex gap-4 p-4 sm:p-5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={product.coverImage?.includes("placehold.co") ?? false}
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/catalogo/${product.slug}`} className="font-medium text-foreground hover:underline">
                  {product.name}
                </Link>
                {item.designId ? (
                  <p className="text-xs text-muted-foreground">Diseño personalizado</p>
                ) : null}
                <p className="mt-0.5 text-sm text-muted-foreground">{product.price} × {item.quantity}</p>
              </div>
              <div className="flex flex-col items-end justify-between gap-2">
                <p className="font-semibold text-foreground">
                  {(lineTotal / 100).toFixed(2).replace(".", ",")} €
                </p>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.designId)}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Menos"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.designId)}
                    className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Más"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.designId)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Quitar
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col items-end gap-4 rounded-2xl border border-border bg-card p-5">
        <p className="text-lg font-semibold text-foreground">
          Total: {(totalCents / 100).toFixed(2).replace(".", ",")} €
        </p>
        <Link
          href="/carrito/checkout"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:opacity-90"
        >
          Finalizar compra
        </Link>
      </div>
    </div>
  );
}
