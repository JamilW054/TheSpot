"use client";

import { sizeAxisLabel, unitPriceForSelection } from "@/lib/variants";
import { ChevronLeft, Trash2, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AcceptedPayments } from "@/components/brand/AcceptedPayments";
import { useCart } from "@/contexts/cart-context";
import type { ShippingMethod } from "@/database/repositories";
import { formatDOPFromCents } from "@/lib/format-currency";
import type { CartItem, CatalogProduct } from "@/types";


function isExternalImage(src: string): boolean {
  return src.startsWith("http") || src.includes("placehold.co");
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyCart() {
  return (
    <div className="animate-scale-in rounded-[14px] border border-border bg-card p-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/60">
        <svg
          className="size-10 text-muted-foreground"
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
      <h2 className="text-xl font-semibold text-foreground">
        Tu carrito está vacío
      </h2>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Añade productos desde el catálogo y vuelve aquí para finalizar tu
        pedido.
      </p>
      <Link
        href="/catalogo"
        className="mt-8 inline-flex items-center justify-center rounded-[10px] bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Ir al catálogo
      </Link>
    </div>
  );
}

/* ── Single item card ────────────────────────────────────── */
interface CartItemCardProps {
  item: CartItem;
  product: CatalogProduct;
  onUpdate: (
    productId: string,
    qty: number,
    size?: string | null,
    color?: string | null,
  ) => void;
  onRemove: (
    productId: string,
    size?: string | null,
    color?: string | null,
  ) => void;
}

function CartItemCard({
  item,
  product,
  onUpdate,
  onRemove,
}: CartItemCardProps) {
  return (
    <li className="group flex gap-3 rounded-[14px] border border-border bg-card p-4 transition-[border-color] duration-200 hover:border-primary/20">
      {/* Imagen */}
      <Link
        href={`/catalogo/${product.slug}`}
        className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px] bg-muted"
        tabIndex={-1}
        aria-hidden
      >
        <Image
          src={product.coverImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="72px"
          unoptimized={isExternalImage(product.coverImage)}
        />
      </Link>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {product.brandName ? (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.brandName}
          </span>
        ) : null}
        <Link
          href={`/catalogo/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        {item.size || item.color ? (
          <span className="flex flex-wrap gap-1.5">
            {item.size ? (
              <span className="self-start rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {sizeAxisLabel([item.size]).noun}: {item.size}
              </span>
            ) : null}
            {item.color ? (
              <span className="self-start rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Color: {item.color}
              </span>
            ) : null}
          </span>
        ) : null}
        <span className="font-mono text-sm font-bold text-primary">
          {formatDOPFromCents(unitPriceForSelection(product, item.size, item.color))}
        </span>
      </div>

      {/* Controles */}
      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        {/* Eliminar */}
        <button
          type="button"
          onClick={() => onRemove(item.productId, item.size, item.color)}
          className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:text-destructive"
          aria-label="Quitar del carrito"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>

        {/* Cantidad */}
        <div className="flex items-center rounded-[10px] border border-border bg-background">
          <button
            type="button"
            onClick={() =>
              onUpdate(item.productId, item.quantity - 1, item.size, item.color)
            }
            className="flex h-8 w-8 items-center justify-center text-lg leading-none text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Reducir cantidad"
          >
            −
          </button>
          <span className="min-w-7 text-center text-sm font-semibold tabular-nums text-foreground">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              onUpdate(item.productId, item.quantity + 1, item.size, item.color)
            }
            className="flex h-8 w-8 items-center justify-center text-lg leading-none text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
      </div>
    </li>
  );
}

/* ── Main export ─────────────────────────────────────────── */
export function CartContent({
  products,
}: {
  products: CatalogProduct[];
  shippingMethods?: ShippingMethod[];
}) {
  const { items, updateQuantity, removeItem } = useCart();
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Auto-remove stale cart items (products deleted or not returned by the catalog).
  useEffect(() => {
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        removeItem(item.productId, item.size, item.color);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) return <EmptyCart />;

  let subtotalCents = 0;
  let totalItems = 0;
  // Marketplace: el carrito se muestra agrupado por tienda (cada una envía su pedido).
  const groups = new Map<string, { name: string; slug: string | null; items: CartItem[]; subtotal: number }>();
  for (const item of items) {
    const p = productMap.get(item.productId);
    totalItems += item.quantity;
    if (!p) continue;
    const line = unitPriceForSelection(p, item.size, item.color) * item.quantity;
    subtotalCents += line;
    const key = p.storeId ?? "unknown";
    const g = groups.get(key) ?? { name: p.storeName ?? "The Spot", slug: p.storeSlug ?? null, items: [], subtotal: 0 };
    g.items.push(item);
    g.subtotal += line;
    groups.set(key, g);
  }

  return (
    <>
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8">
        {/* ── Items ── */}
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
            {groups.size > 1 ? ` · ${groups.size} tiendas` : ""}
          </p>

          <div className="space-y-6">
            {[...groups.entries()].map(([storeId, g]) => (
              <section key={storeId} aria-label={`Productos de ${g.name}`}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Vendido por{" "}
                    {g.slug ? (
                      <Link href={`/tiendas/${g.slug}`} className="text-primary hover:underline">
                        {g.name}
                      </Link>
                    ) : (
                      g.name
                    )}
                  </p>
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {formatDOPFromCents(g.subtotal)}
                  </span>
                </div>
                <ul className="animate-stagger space-y-3">
                  {g.items.map((item) => {
                    const product = productMap.get(item.productId);
                    if (!product) return null;
                    return (
                      <CartItemCard
                        key={`${item.productId}:${item.size ?? ""}:${item.color ?? ""}`}
                        item={item}
                        product={product}
                        onUpdate={updateQuantity}
                        onRemove={removeItem}
                      />
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          <Link
            href="/catalogo"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Seguir comprando
          </Link>
        </div>

        {/* ── Sidebar ── */}
        <aside className="mt-6 space-y-3 lg:mt-0 lg:sticky lg:top-28">
          <div className="rounded-[14px] border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Resumen</h3>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-mono text-xl font-bold tabular-nums text-primary">
                {formatDOPFromCents(subtotalCents)}
              </span>
            </div>
            <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
              <Truck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              El envío y los cupones se eligen al finalizar, por cada tienda.
            </p>
            <Link
              href="/carrito/checkout"
              className="mt-4 flex w-full items-center justify-center rounded-[10px] bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Finalizar pedido
            </Link>
            <p className="mt-2 text-center text-xs text-muted-foreground">Pago contra entrega o transferencia</p>
            <AcceptedPayments className="mt-3" align="center" label={null} />
          </div>
        </aside>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">{totalItems} artículo(s)</p>
            <p className="font-mono text-lg font-bold tabular-nums text-primary leading-tight">
              {formatDOPFromCents(subtotalCents)}
            </p>
          </div>
          <Link
            href="/carrito/checkout"
            className="flex-1 rounded-[10px] bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Finalizar pedido
          </Link>
        </div>
      </div>
    </>
  );
}
