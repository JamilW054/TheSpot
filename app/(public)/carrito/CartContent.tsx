"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2, Tag, ChevronLeft, Truck } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { formatDOPFromCents } from "@/lib/format-currency";
import type { CartItem, CatalogProduct } from "@/types";
import type { ShippingMethod } from "@/lib/db";

const MIN_ORDER_CENTS = Number(process.env.NEXT_PUBLIC_MIN_ORDER_CENTS ?? "0");

function formatShippingDesc(method: ShippingMethod): string {
  if (method.description) return method.description;
  if (method.minDays != null && method.maxDays != null)
    return `${method.minDays}-${method.maxDays} días hábiles`;
  if (method.minDays != null) return `A partir de ${method.minDays} días`;
  return "";
}

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
    designId?: string | null,
    size?: string | null,
  ) => void;
  onRemove: (
    productId: string,
    designId?: string | null,
    size?: string | null,
  ) => void;
}

function CartItemCard({ item, product, onUpdate, onRemove }: CartItemCardProps) {
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
        {item.size ? (
          <span className="self-start rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Talla: {item.size}
          </span>
        ) : null}
        {item.designId ? (
          <span className="text-[11px] font-medium text-muted-foreground">
            Diseño personalizado
          </span>
        ) : null}
        <span className="font-mono text-sm font-bold text-primary">
          {product.price}
        </span>
      </div>

      {/* Controles */}
      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        {/* Eliminar */}
        <button
          type="button"
          onClick={() => onRemove(item.productId, item.designId, item.size)}
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
              onUpdate(item.productId, item.quantity - 1, item.designId, item.size)
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
              onUpdate(item.productId, item.quantity + 1, item.designId, item.size)
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

/* ── Shipping selector ───────────────────────────────────── */
interface ShippingSelectorProps {
  methods: ShippingMethod[];
  selected: string;
  onSelect: (id: string) => void;
}

function ShippingSelector({ methods, selected, onSelect }: ShippingSelectorProps) {
  return (
    <div className="rounded-[14px] border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Truck className="size-4 text-muted-foreground" aria-hidden />
        <h3 className="text-sm font-semibold text-foreground">Tipo de envío</h3>
      </div>
      <div className="space-y-2">
        {methods.map((method) => {
          const active = selected === method.id;
          const desc = formatShippingDesc(method);
          return (
            <label
              key={method.id}
              className={`flex cursor-pointer items-center gap-3 rounded-[10px] border p-3 transition-all duration-150 ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/20 hover:border-border/60"
              }`}
            >
              <input
                type="radio"
                name="shipping"
                value={method.id}
                checked={active}
                onChange={() => onSelect(method.id)}
                className="sr-only"
              />
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  active ? "border-primary" : "border-border"
                }`}
                aria-hidden
              >
                {active && <span className="h-2 w-2 rounded-full bg-primary" />}
              </span>

              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-foreground">
                  {method.name}
                </span>
                {desc && (
                  <span className="block text-xs text-muted-foreground">
                    {desc}
                  </span>
                )}
              </span>

              <span className="shrink-0 font-mono text-sm font-bold text-foreground tabular-nums">
                {formatDOPFromCents(method.priceCents)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ── Promo code ──────────────────────────────────────────── */
interface PromoInputProps {
  code: string;
  onChange: (v: string) => void;
  onApply: () => void;
  error: string | null;
  applied: boolean;
}

function PromoInput({ code, onChange, onApply, error, applied }: PromoInputProps) {
  return (
    <div className="rounded-[14px] border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Tag className="size-4 text-muted-foreground" aria-hidden />
        <h3 className="text-sm font-semibold text-foreground">
          ¿Tienes un código?
        </h3>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="BUXXEP10"
          className="flex-1 rounded-[10px] border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
        <button
          type="button"
          onClick={onApply}
          className="rounded-[10px] bg-muted px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted/80"
        >
          Aplicar
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
      {applied && (
        <p className="mt-2 text-xs text-primary font-medium">
          ¡Código aplicado correctamente!
        </p>
      )}
    </div>
  );
}

/* ── Order summary ───────────────────────────────────────── */
interface OrderSummaryProps {
  subtotalCents: number;
  shippingCents: number;
  grandTotalCents: number;
  belowMin: boolean;
  minOrderCents: number;
  shippingId: string;
  className?: string;
  showCheckoutBtn?: boolean;
}

function OrderSummary({
  subtotalCents,
  shippingCents,
  grandTotalCents,
  belowMin,
  minOrderCents,
  shippingId,
  className = "",
  showCheckoutBtn = true,
}: OrderSummaryProps) {
  return (
    <div className={`rounded-[14px] border border-border bg-card p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-semibold text-foreground">Resumen</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-mono text-sm font-medium tabular-nums text-foreground">
            {formatDOPFromCents(subtotalCents)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Envío</span>
          <span className="font-mono text-sm font-medium tabular-nums text-foreground">
            {formatDOPFromCents(shippingCents)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-border pt-2">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="font-mono text-xl font-bold tabular-nums text-primary">
            {formatDOPFromCents(grandTotalCents)}
          </span>
        </div>
      </div>

      {belowMin && (
        <div className="mt-3 rounded-[10px] border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
          <p className="text-xs font-medium text-amber-500 leading-snug">
            Monto mínimo:{" "}
            <span className="font-bold">{formatDOPFromCents(minOrderCents)}</span>
          </p>
          <p className="mt-0.5 text-xs text-amber-500/80">
            Te faltan {formatDOPFromCents(minOrderCents - subtotalCents)} para
            continuar.
          </p>
        </div>
      )}

      {showCheckoutBtn && (
        <>
          {belowMin ? (
            <button
              type="button"
              disabled
              className="mt-4 flex w-full cursor-not-allowed items-center justify-center rounded-[10px] bg-muted py-3 text-sm font-semibold text-muted-foreground opacity-50"
            >
              Finalizar compra
            </button>
          ) : (
            <Link
              href={`/carrito/checkout?shipping=${shippingId}`}
              className="mt-4 flex w-full items-center justify-center rounded-[10px] bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Confirmar y pagar
            </Link>
          )}
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Pago seguro en el siguiente paso
          </p>
        </>
      )}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────── */
export function CartContent({
  products,
  shippingMethods,
}: {
  products: CatalogProduct[];
  shippingMethods: ShippingMethod[];
}) {
  const { items, updateQuantity, removeItem } = useCart();
  const [shippingId, setShippingId] = useState<string>(
    () => shippingMethods[0]?.id ?? "",
  );
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoApplied, setPromoApplied] = useState(false);

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Auto-remove stale cart items (products deleted or not returned by the catalog).
  useEffect(() => {
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        removeItem(item.productId, item.designId, item.size);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) return <EmptyCart />;

  let subtotalCents = 0;
  let totalItems = 0;

  for (const item of items) {
    const p = productMap.get(item.productId);
    if (p) subtotalCents += p.priceCents * item.quantity;
    totalItems += item.quantity;
  }

  const selectedShipping =
    shippingMethods.find((s) => s.id === shippingId) ?? shippingMethods[0];
  const grandTotalCents = subtotalCents + (selectedShipping?.priceCents ?? 0);
  const belowMin = MIN_ORDER_CENTS > 0 && subtotalCents < MIN_ORDER_CENTS;

  const handleApplyPromo = () => {
    setPromoError("Código inválido o expirado.");
    setPromoApplied(false);
  };

  return (
    <>
      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8">
        {/* ── Items ── */}
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
          </p>

          <ul className="animate-stagger space-y-3">
            {items.map((item) => {
              const product = productMap.get(item.productId);
              if (!product) return null;
              return (
                <CartItemCard
                  key={`${item.productId}:${item.designId ?? ""}:${item.size ?? ""}`}
                  item={item}
                  product={product}
                  onUpdate={updateQuantity}
                  onRemove={removeItem}
                />
              );
            })}
          </ul>

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
          <ShippingSelector
            methods={shippingMethods}
            selected={shippingId}
            onSelect={setShippingId}
          />

          <PromoInput
            code={promoCode}
            onChange={setPromoCode}
            onApply={handleApplyPromo}
            error={promoError}
            applied={promoApplied}
          />

          <OrderSummary
            subtotalCents={subtotalCents}
            shippingCents={selectedShipping.priceCents}
            grandTotalCents={grandTotalCents}
            belowMin={belowMin}
            minOrderCents={MIN_ORDER_CENTS}
            shippingId={shippingId}
            showCheckoutBtn
            className="hidden lg:block"
          />
        </aside>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              {totalItems} artículo(s)
            </p>
            <p className="font-mono text-lg font-bold tabular-nums text-primary leading-tight">
              {formatDOPFromCents(grandTotalCents)}
            </p>
          </div>
          {belowMin ? (
            <button
              type="button"
              disabled
              className="flex-1 cursor-not-allowed rounded-[10px] bg-muted py-3 text-sm font-semibold text-muted-foreground opacity-50"
            >
              Finalizar compra
            </button>
          ) : (
            <Link
              href={`/carrito/checkout?shipping=${shippingId}`}
              className="flex-1 rounded-[10px] bg-primary py-3 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Confirmar y pagar
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
