"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatDOPFromCents } from "@/lib/format-currency";
import type { CatalogProduct } from "@/types";

const MIN_ORDER_CENTS = Number(process.env.NEXT_PUBLIC_MIN_ORDER_CENTS ?? "0");

function isExternalImage(src: string): boolean {
  return (
    src.includes("placehold.co") ||
    src.includes("imgur.com") ||
    src.includes("unsplash.com") ||
    src.startsWith("http")
  );
}

export function CartContent({ products }: { products: CatalogProduct[] }) {
  const { items, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-16 sm:p-20 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
          <svg
            className="size-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <h2 className="mt-8 text-xl font-semibold text-foreground">
          Tu carrito está vacío
        </h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Añade productos desde el catálogo y vuelve aquí para finalizar tu
          pedido.
        </p>
        <Link
          href="/catalogo"
          className="mt-10 inline-flex items-center justify-center rounded-xl bg-primary px-10 py-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  let totalCents = 0;
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 xl:gap-12">
      {/* Lista de productos */}
      <div className="lg:min-w-0">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
        </p>
        <ul className="space-y-4">
          {items.map((item) => {
            const product = productMap.get(item.productId);
            if (!product) return null;
            const lineTotal = product.priceCents * item.quantity;
            totalCents += lineTotal;
            return (
              <li
                key={`${item.productId}:${item.designId ?? ""}:${item.size ?? ""}`}
                className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-6 sm:p-5"
              >
                <Link
                  href={`/catalogo/${product.slug}`}
                  className="relative block aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/50 sm:h-24 sm:w-24"
                >
                  <Image
                    src={product.coverImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 96px"
                    unoptimized={isExternalImage(product.coverImage)}
                  />
                </Link>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <Link
                    href={`/catalogo/${product.slug}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.size ? (
                      <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-foreground">
                        {item.size}
                      </span>
                    ) : null}
                    {item.designId ? (
                      <span className="inline-block text-xs font-medium text-muted-foreground">
                        Diseño personalizado
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {product.price}{" "}
                    <span className="text-foreground/80">
                      × {item.quantity}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 sm:justify-end sm:border-0 sm:pt-0 sm:flex-nowrap">
                  <div className="flex items-center rounded-lg border border-border bg-muted/20">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity - 1,
                          item.designId,
                          item.size,
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Reducir cantidad"
                    >
                      −
                    </button>
                    <span className="min-w-9 text-center text-sm font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity + 1,
                          item.designId,
                          item.size,
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    {formatDOPFromCents(lineTotal)}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(item.productId, item.designId, item.size)
                    }
                    className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
                    aria-label="Quitar del carrito"
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-6">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Seguir comprando
          </Link>
        </p>
      </div>

      {/* Resumen del pedido — sticky en desktop */}
      <aside className="mt-8 lg:mt-0 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Resumen del pedido
          </h2>
          <div className="mt-4 border-t border-border pt-4 space-y-2">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold tabular-nums text-primary">
                {formatDOPFromCents(totalCents)}
              </span>
            </div>
            {MIN_ORDER_CENTS > 0 && totalCents < MIN_ORDER_CENTS && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2.5">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium leading-snug">
                  Monto mínimo de compra:{" "}
                  <span className="font-bold">
                    {formatDOPFromCents(MIN_ORDER_CENTS)}
                  </span>
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                  Te faltan {formatDOPFromCents(MIN_ORDER_CENTS - totalCents)}{" "}
                  para continuar.
                </p>
              </div>
            )}
          </div>
          {MIN_ORDER_CENTS > 0 && totalCents < MIN_ORDER_CENTS ? (
            <button
              type="button"
              disabled
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-muted px-6 py-3.5 text-base font-semibold text-muted-foreground cursor-not-allowed opacity-60"
            >
              Finalizar compra
            </button>
          ) : (
            <Link
              href="/carrito/checkout"
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow"
            >
              Finalizar compra
            </Link>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Pago seguro en el siguiente paso
          </p>
        </div>
      </aside>
    </div>
  );
}
