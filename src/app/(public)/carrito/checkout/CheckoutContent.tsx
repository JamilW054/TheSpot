"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BankAccountCard } from "@/components/checkout/BankAccountCard";
import { FreeShippingProgress } from "@/components/cart/FreeShippingProgress";
import {
  qualifiesForFreeShipping,
  resolveShippingCents,
} from "@/config/shipping";
import { useCart } from "@/contexts/cart-context";
import { useStoreSettings } from "@/contexts/store-settings-context";
import type { ShippingMethod } from "@/database/repositories";
import type {
  BankAccountSnapshot,
  CheckoutPaymentOptions,
  PaymentMethod,
} from "@/database/repositories/payments";
import { checkoutAction } from "@/lib/actions/checkout";
import { validateCouponAction } from "@/lib/actions/coupons";
import { formatDOPFromCents } from "@/lib/format-currency";
import { unitPriceForSelection } from "@/lib/variants";
import type { CatalogProduct } from "@/types";

function isExternalImage(src: string): boolean {
  return (
    src.includes("placehold.co") ||
    src.includes("imgur.com") ||
    src.includes("unsplash.com") ||
    src.startsWith("http")
  );
}

const inputClass =
  "h-11 w-full rounded-[10px] border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";

const labelClass = "block text-sm font-medium text-foreground";

interface OrderConfirmation {
  orderNumber: string;
  totalCents: number;
  whatsappUrl: string | null;
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  bankAccount: BankAccountSnapshot | null;
  paymentNote: string;
}

function ConfirmationScreen({ order }: { order: OrderConfirmation }) {
  return (
    <div className="mx-auto max-w-lg rounded-[14px] border border-border bg-card p-8 sm:p-10 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <svg
          className="size-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h2 className="mt-5 text-xl font-semibold text-foreground">
        ¡Pedido recibido!
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Tu número de pedido es{" "}
        <span className="font-mono font-semibold text-foreground">
          #{order.orderNumber}
        </span>
        . Total: {formatDOPFromCents(order.totalCents)}.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Método de pago:{" "}
        <span className="font-medium text-foreground">
          {order.paymentMethodLabel}
        </span>
        .
      </p>
      {order.paymentMethod === "bank_transfer" && order.bankAccount ? (
        <div className="mt-5 space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Datos para transferir
          </p>
          <BankAccountCard
            account={order.bankAccount}
            amountLabel={formatDOPFromCents(order.totalCents)}
          />
          <p className="text-xs text-muted-foreground">
            Usa <span className="font-mono">#{order.orderNumber}</span> como
            concepto. {order.paymentNote}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          {order.paymentNote} Te contactaremos para coordinar la entrega.
        </p>
      )}
      {order.whatsappUrl && (
        <a
          href={order.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#25D366] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Confirmar pedido por WhatsApp
        </a>
      )}
      <div className="mt-4">
        <Link
          href={`/estado-pedido?pedido=${order.orderNumber}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Consultar estado del pedido más tarde
        </Link>
      </div>
    </div>
  );
}

export function CheckoutContent({
  products,
  shippingMethods,
  paymentOptions,
}: {
  products: CatalogProduct[];
  shippingMethods: ShippingMethod[];
  paymentOptions: CheckoutPaymentOptions;
}) {
  const { freeShippingMinCents } = useStoreSettings();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    paymentOptions.methods[0]?.method ?? "cash_on_delivery",
  );
  const [bankAccountId, setBankAccountId] = useState<string | null>(
    paymentOptions.bankAccounts.length === 1
      ? paymentOptions.bankAccounts[0].id
      : null,
  );
  const selectedBank =
    paymentOptions.bankAccounts.find((b) => b.id === bankAccountId) ?? null;
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderConfirmation | null>(null);

  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    shippingMethods[0]?.id ?? null,
  );

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const productMap = new Map(products.map((p) => [p.id, p]));
  let subtotalCents = 0;
  items.forEach((item) => {
    const p = productMap.get(item.productId);
    if (p)
      subtotalCents +=
        unitPriceForSelection(p, item.size, item.color) * item.quantity;
  });

  const selectedShipping =
    shippingMethods.find((m) => m.id === selectedShippingId) ?? null;
  const freeShipping = qualifiesForFreeShipping(
    subtotalCents,
    freeShippingMinCents,
  );
  const shippingCents = resolveShippingCents(
    subtotalCents,
    selectedShipping?.priceCents ?? 0,
    freeShippingMinCents,
  );
  const discountCents = appliedCoupon ? couponDiscount : 0;
  const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents);

  const handleApplyCoupon = async () => {
    setCouponError(null);
    const code = couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    const res = await validateCouponAction(code, subtotalCents);
    setCouponLoading(false);
    if (res.valid) {
      setAppliedCoupon(res.code ?? code);
      setCouponDiscount(res.discountCents ?? 0);
    } else {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponError(res.reason ?? "Cupón no válido.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (paymentMethod === "bank_transfer" && !bankAccountId) {
      setError("Elige el banco al que vas a transferir.");
      return;
    }
    setLoading(true);

    const form = e.currentTarget;
    const value = (id: string) =>
      (
        (
          form.querySelector(`#${id}`) as
            | HTMLInputElement
            | HTMLTextAreaElement
            | null
        )?.value ?? ""
      ).trim();

    const result = await checkoutAction({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size ?? null,
        color: item.color ?? null,
      })),
      shipping: {
        name: value("checkout-name"),
        email: value("checkout-email"),
        phone: value("checkout-phone"),
        address: value("checkout-address"),
        city: value("checkout-city") || null,
        postalCode: value("checkout-postal") || null,
        country: value("checkout-country") || null,
      },
      shippingMethodId: selectedShippingId,
      couponCode: appliedCoupon,
      notes: value("checkout-notes") || null,
      paymentMethod,
      bankAccountId: paymentMethod === "bank_transfer" ? bankAccountId : null,
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    clearCart();
    setOrder({
      orderNumber: result.result.orderNumber,
      totalCents: result.result.totalCents,
      whatsappUrl: result.result.whatsappUrl,
      paymentMethod: result.result.paymentMethod,
      paymentMethodLabel: result.result.paymentMethodLabel,
      bankAccount: result.result.bankAccount,
      paymentNote:
        paymentOptions.methods.find(
          (m) => m.method === result.result.paymentMethod,
        )?.note ?? "",
    });
  };

  if (order) {
    return <ConfirmationScreen order={order} />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[14px] border border-border bg-card p-12 sm:p-16 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
          <svg
            className="size-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="Carrito vacío"
          >
            <title>Carrito vacío</title>
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <h2 className="mt-6 text-xl font-semibold text-foreground">
          No hay productos en el carrito
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Añade productos desde el catálogo y vuelve al checkout.
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

  return (
    <form
      onSubmit={handleSubmit}
      className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 xl:gap-12"
    >
      {/* Datos de entrega */}
      <div className="lg:min-w-0">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Datos de entrega
        </p>

        <div className="rounded-[14px] border border-border bg-card p-4 sm:p-5 space-y-5">
          <div>
            <label htmlFor="checkout-name" className={labelClass}>
              Nombre completo
            </label>
            <input
              id="checkout-name"
              type="text"
              required
              className={inputClass}
              placeholder="Tu nombre"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="checkout-email" className={labelClass}>
                Correo
              </label>
              <input
                id="checkout-email"
                type="email"
                required
                className={inputClass}
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label htmlFor="checkout-phone" className={labelClass}>
                Teléfono
              </label>
              <input
                id="checkout-phone"
                type="tel"
                required
                className={inputClass}
                placeholder="+1 (809) 000-0000"
              />
            </div>
          </div>
          <div>
            <label htmlFor="checkout-address" className={labelClass}>
              Dirección de entrega
            </label>
            <textarea
              id="checkout-address"
              required
              rows={3}
              className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
              placeholder="Calle, número, referencia..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="checkout-city" className={labelClass}>
                Ciudad
              </label>
              <input
                id="checkout-city"
                type="text"
                className={inputClass}
                placeholder="Santo Domingo"
              />
            </div>
            <div>
              <label htmlFor="checkout-postal" className={labelClass}>
                Código postal
              </label>
              <input
                id="checkout-postal"
                type="text"
                className={inputClass}
                placeholder="10100"
              />
            </div>
          </div>
          <div>
            <label htmlFor="checkout-country" className={labelClass}>
              País
            </label>
            <input
              id="checkout-country"
              type="text"
              className={inputClass}
              placeholder="República Dominicana"
              defaultValue="República Dominicana"
            />
          </div>
          <div>
            <label htmlFor="checkout-notes" className={labelClass}>
              Notas del pedido{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </label>
            <textarea
              id="checkout-notes"
              rows={2}
              maxLength={500}
              className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
              placeholder="Horario de entrega, referencia, es un regalo…"
            />
          </div>
        </div>

        {/* Método de pago */}
        <p className="mb-4 mt-8 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Método de pago
        </p>
        <div className="space-y-3 rounded-[14px] border border-border bg-card p-4 sm:p-5">
          {paymentOptions.methods.map((m) => (
            <label
              key={m.method}
              className={`flex cursor-pointer items-start gap-3 rounded-[10px] border p-3 text-sm transition-colors ${
                paymentMethod === m.method
                  ? "border-primary/60 bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value={m.method}
                checked={paymentMethod === m.method}
                onChange={() => setPaymentMethod(m.method)}
                className="mt-0.5 accent-primary"
              />
              <span>
                <span className="block font-medium text-foreground">
                  {m.label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {m.note}
                </span>
              </span>
            </label>
          ))}

          {paymentMethod === "bank_transfer" && (
            <div className="space-y-3 pt-1">
              <p className="text-sm font-medium text-foreground">
                ¿A qué banco vas a transferir?
              </p>
              <div className="flex flex-wrap gap-2">
                {paymentOptions.bankAccounts.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBankAccountId(b.id)}
                    aria-pressed={bankAccountId === b.id}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      bankAccountId === b.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/60"
                    }`}
                  >
                    {b.bankName}
                  </button>
                ))}
              </div>
              {selectedBank ? (
                <BankAccountCard
                  account={selectedBank}
                  amountLabel={formatDOPFromCents(totalCents)}
                />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Elige un banco para ver los datos de la cuenta.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resumen del pedido */}
      <aside className="mt-8 lg:mt-0 lg:sticky lg:top-28 lg:self-start">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Resumen del pedido
        </p>
        <div className="rounded-[14px] border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const product = productMap.get(item.productId);
              if (!product) return null;
              const unitCents = unitPriceForSelection(
                product,
                item.size,
                item.color,
              );
              const lineTotal = unitCents * item.quantity;
              return (
                <li
                  key={`${item.productId}:${item.size ?? ""}:${item.color ?? ""}`}
                  className="flex gap-4 p-4 sm:p-5"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-muted ring-1 ring-border/50">
                    <Image
                      src={product.coverImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized={isExternalImage(product.coverImage)}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {product.name}
                    </p>
                    {item.size && (
                      <p className="text-xs text-muted-foreground">
                        {item.size}
                      </p>
                    )}
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">
                      {formatDOPFromCents(unitCents)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-semibold tabular-nums text-foreground shrink-0">
                    {formatDOPFromCents(lineTotal)}
                  </p>
                </li>
              );
            })}
          </ul>
          {/* Método de envío */}
          {shippingMethods.length > 0 && (
            <div className="border-t border-border p-5 sm:p-6 space-y-2">
              <p className="text-sm font-semibold text-foreground">Envío</p>
              <FreeShippingProgress
                subtotalCents={subtotalCents}
                className="mb-3"
              />
              {shippingMethods.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border p-3 text-sm transition-colors ${
                    selectedShippingId === m.id
                      ? "border-primary/60 bg-primary/5"
                      : "border-border hover:border-border/70"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="shipping_method"
                      checked={selectedShippingId === m.id}
                      onChange={() => setSelectedShippingId(m.id)}
                      className="accent-primary"
                    />
                    <span>
                      <span className="font-medium text-foreground">
                        {m.name}
                      </span>
                      {(m.minDays != null || m.maxDays != null) && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({m.minDays ?? "?"}-{m.maxDays ?? "?"} días)
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 font-mono tabular-nums text-foreground">
                    {freeShipping && m.priceCents > 0 && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatDOPFromCents(m.priceCents)}
                      </span>
                    )}
                    <span>
                      {freeShipping || m.priceCents === 0
                        ? "Gratis"
                        : formatDOPFromCents(m.priceCents)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Cupón de descuento */}
          <div className="border-t border-border p-5 sm:p-6 space-y-2">
            <p className="text-sm font-semibold text-foreground">Cupón</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                className="h-10 flex-1 rounded-[10px] border border-border bg-background px-3 text-sm uppercase text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="rounded-[10px] border border-border bg-muted/40 px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {couponLoading ? "…" : "Aplicar"}
              </button>
            </div>
            {couponError && (
              <p className="text-xs text-destructive">{couponError}</p>
            )}
            {appliedCoupon && (
              <p className="text-xs font-medium text-primary">
                Cupón {appliedCoupon} aplicado: −
                {formatDOPFromCents(discountCents)}
              </p>
            )}
          </div>

          <div className="border-t border-border p-5 sm:p-6">
            <dl className="mb-4 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-mono tabular-nums text-foreground">
                  {formatDOPFromCents(subtotalCents)}
                </dd>
              </div>
              {discountCents > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Descuento</dt>
                  <dd className="font-mono tabular-nums text-primary">
                    −{formatDOPFromCents(discountCents)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Envío</dt>
                <dd className="font-mono tabular-nums text-foreground">
                  {shippingCents === 0
                    ? "Gratis"
                    : formatDOPFromCents(shippingCents)}
                </dd>
              </div>
            </dl>
            <div className="flex items-baseline justify-between gap-4 mb-4 border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-mono text-xl font-bold tabular-nums text-primary">
                {formatDOPFromCents(totalCents)}
              </span>
            </div>
            {error && (
              <p className="mb-4 rounded-[10px] border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[10px] bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Enviando…" : "Confirmar pedido"}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Al confirmar recibirás tu número de pedido. Te contactaremos para
              coordinar la entrega.
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
