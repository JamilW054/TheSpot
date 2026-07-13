"use client";

import { Check, Plus, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FreeShippingProgress } from "@/components/cart/FreeShippingProgress";
import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector";
import {
  qualifiesForFreeShipping,
  resolveShippingCents,
} from "@/config/shipping";
import { useCart } from "@/contexts/cart-context";
import type { ShippingMethod } from "@/database/repositories";
import type { Address } from "@/database/repositories/addresses";
import type { PaymentMethodOption } from "@/database/repositories/payments";
import { checkoutAction } from "@/lib/actions/checkout";
import { validateCouponAction } from "@/lib/actions/coupons";
import { requestPaymentLinkForOrder } from "@/lib/actions/payments";
import { formatDOPFromCents } from "@/lib/format-currency";
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

interface ShippingData {
  name: string;
  email: string;
  address: string;
  phone?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

function shippingFromAddress(a: Address, email: string): ShippingData {
  return {
    name: a.fullName ?? "",
    email,
    address: [a.addressLine1, a.addressLine2].filter(Boolean).join(", "),
    phone: a.phone ?? undefined,
    city: a.city,
    postalCode: a.postalCode,
    country: a.countryCode,
  };
}

function AddressRadioCard({
  address,
  selected,
  onSelect,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full rounded-[14px] border p-4 text-left transition-all duration-150 ${
        selected
          ? "border-primary/60 bg-primary/5"
          : "border-border bg-card hover:border-border/70 hover:bg-muted/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
            selected
              ? "border-primary bg-primary"
              : "border-muted-foreground/40 group-hover:border-primary/50"
          }`}
        >
          {selected && <Check className="size-2.5 text-primary-foreground" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {address.label && (
              <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-foreground">
                {address.label}
              </span>
            )}
            {address.isDefault && (
              <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                <Star className="size-3 fill-primary" aria-hidden />
                Predeterminada
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground">
            {address.fullName}
          </p>
          <p className="text-xs text-muted-foreground">
            {address.addressLine1}
            {address.addressLine2 && `, ${address.addressLine2}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {address.city}, {address.postalCode}
          </p>
          {address.phone && (
            <p className="text-xs text-muted-foreground">{address.phone}</p>
          )}
        </div>
      </div>
    </button>
  );
}

export function CheckoutContent({
  products,
  savedAddresses,
  shippingMethods,
  paymentMethods,
}: {
  products: CatalogProduct[];
  savedAddresses: Address[];
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethodOption[];
}) {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Método de pago: por defecto el primero activo y no deshabilitado.
  const activeMethod =
    paymentMethods.find((m) => !m.isDisabled && m.isActive) ?? null;
  const [selectedMethodCode, setSelectedMethodCode] = useState<string>(
    activeMethod?.code ?? "payment_link",
  );
  const isAzul = selectedMethodCode === "azul";

  const defaultAddress =
    savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0] ?? null;
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddress?.id ?? null,
  );
  const [useNewAddress, setUseNewAddress] = useState(
    savedAddresses.length === 0,
  );

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
    if (p) subtotalCents += p.priceCents * item.quantity;
  });

  const selectedShipping =
    shippingMethods.find((m) => m.id === selectedShippingId) ?? null;
  const freeShipping = qualifiesForFreeShipping(subtotalCents);
  const shippingCents = resolveShippingCents(
    subtotalCents,
    selectedShipping?.priceCents ?? 0,
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

  const selectedAddress =
    !useNewAddress && selectedAddressId
      ? (savedAddresses.find((a) => a.id === selectedAddressId) ?? null)
      : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let shipping: ShippingData;

    if (selectedAddress) {
      const emailInput =
        (
          e.currentTarget.querySelector(
            "#checkout-email",
          ) as HTMLInputElement | null
        )?.value.trim() ?? "";
      shipping = shippingFromAddress(selectedAddress, emailInput);
    } else {
      const checkoutForm = e.currentTarget;
      shipping = {
        name: (
          (
            checkoutForm.querySelector(
              "#checkout-name",
            ) as HTMLInputElement | null
          )?.value ?? ""
        ).trim(),
        email: (
          (
            checkoutForm.querySelector(
              "#checkout-email",
            ) as HTMLInputElement | null
          )?.value ?? ""
        ).trim(),
        address: (
          (
            checkoutForm.querySelector(
              "#checkout-address",
            ) as HTMLTextAreaElement | null
          )?.value ?? ""
        ).trim(),
        phone:
          (
            checkoutForm.querySelector("#checkout-phone") as HTMLInputElement
          )?.value?.trim() || undefined,
        city:
          (
            checkoutForm.querySelector("#checkout-city") as HTMLInputElement
          )?.value?.trim() || undefined,
        postalCode:
          (
            checkoutForm.querySelector("#checkout-postal") as HTMLInputElement
          )?.value?.trim() || undefined,
        country:
          (
            checkoutForm.querySelector("#checkout-country") as HTMLInputElement
          )?.value?.trim() || undefined,
      };
    }

    const result = await checkoutAction({
      shipping: {
        name: shipping.name,
        email: shipping.email,
        address: shipping.address,
        phone: shipping.phone ?? null,
        city: shipping.city ?? null,
        postalCode: shipping.postalCode ?? null,
        country: shipping.country ?? null,
      },
      shippingMethodId: selectedShippingId,
      couponCode: appliedCoupon,
    });
    if (!result.ok) {
      setLoading(false);
      setError(result.error);
      return;
    }

    const orderId = result.result.orderId;

    // ── Azul: auto-envía un form POST a la pasarela hospedada ──
    if (isAzul) {
      const redirectForm = document.createElement("form");
      redirectForm.method = "POST";
      redirectForm.action = "/api/pagos/azul/enviar";
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "orderId";
      input.value = orderId;
      redirectForm.appendChild(input);
      document.body.appendChild(redirectForm);
      redirectForm.submit();
      return;
    }

    // ── Payment Link: crear solicitud de pago y llevar al Centro de pagos ──
    const linkResult = await requestPaymentLinkForOrder(orderId);
    setLoading(false);
    if (!linkResult.ok) {
      setError(linkResult.error);
      return;
    }
    clearCart();
    router.push("/cuenta/pagos");
    // Fuerza datos frescos en el Centro de pagos (evita la caché del router,
    // que mostraría la página sin la nueva solicitud / sin la vista previa).
    router.refresh();
  };

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
      {/* Datos de envío */}
      <div className="lg:min-w-0">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Datos de envío
        </p>

        <div className="rounded-[14px] border border-border bg-card p-4 sm:p-5 space-y-5">
          {/* Saved addresses */}
          {savedAddresses.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Direcciones guardadas
              </p>

              {!useNewAddress && (
                <div className="space-y-2">
                  {savedAddresses.map((address) => (
                    <AddressRadioCard
                      key={address.id}
                      address={address}
                      selected={selectedAddressId === address.id}
                      onSelect={() => {
                        setSelectedAddressId(address.id);
                        setUseNewAddress(false);
                      }}
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setUseNewAddress(!useNewAddress);
                  if (!useNewAddress) setSelectedAddressId(null);
                  else setSelectedAddressId(defaultAddress?.id ?? null);
                }}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                {useNewAddress ? (
                  <>
                    <Check className="size-4" />
                    Usar dirección guardada
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Usar otra dirección
                  </>
                )}
              </button>

              {/* Email always shown for payment confirmation */}
              <div className="pt-1">
                <label htmlFor="checkout-email" className={labelClass}>
                  Email de confirmación
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  required
                  className={inputClass}
                  placeholder="tu@email.com"
                />
              </div>
            </div>
          )}

          {/* Manual form */}
          {(savedAddresses.length === 0 || useNewAddress) && (
            <div className="space-y-5">
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
              {savedAddresses.length === 0 && (
                <div>
                  <label htmlFor="checkout-email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    className={inputClass}
                    placeholder="tu@email.com"
                  />
                </div>
              )}
              <div>
                <label htmlFor="checkout-address" className={labelClass}>
                  Dirección
                </label>
                <textarea
                  id="checkout-address"
                  required
                  rows={3}
                  className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  placeholder="Calle, número, piso..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-country" className={labelClass}>
                    País
                  </label>
                  <input
                    id="checkout-country"
                    type="text"
                    className={inputClass}
                    placeholder="República Dominicana"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className={labelClass}>
                    Teléfono
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    className={inputClass}
                    placeholder="+1 (809) 000-0000"
                  />
                </div>
              </div>
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
              const lineTotal = product.priceCents * item.quantity;
              return (
                <li
                  key={`${item.productId}:${item.designId ?? ""}`}
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
                    <p className="font-mono text-xs text-muted-foreground tabular-nums">
                      {product.price} × {item.quantity}
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

          {/* Método de pago */}
          {paymentMethods.length > 0 && (
            <div className="border-t border-border p-5 sm:p-6 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Método de pago
              </p>
              <PaymentMethodSelector
                methods={paymentMethods}
                value={selectedMethodCode}
                onChange={setSelectedMethodCode}
              />
            </div>
          )}

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
              {loading
                ? "Procesando…"
                : isAzul
                  ? "Pagar con AZUL"
                  : "Solicitar enlace de pago"}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {isAzul
                ? "Serás redirigido al pago seguro de Banco Popular (AZUL). Al confirmar aceptas el pedido."
                : "Confirmaremos tu pedido y te enviaremos un enlace de pago seguro. Podrás verlo en tu Centro de pagos."}
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
