"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BankAccountCard } from "@/components/checkout/BankAccountCard";
import { citiesForProvince, DR_PROVINCES } from "@/config/dominican-republic";
import {
  qualifiesForFreeShipping,
  remainingForFreeShipping,
  resolveShippingCents,
} from "@/config/shipping";
import { useCart } from "@/contexts/cart-context";
import type { ShippingMethod } from "@/database/repositories";
import type { CheckoutOrderResult } from "@/database/repositories/checkout";
import type { CheckoutPaymentOptions, PaymentMethod } from "@/database/repositories/payments";
import { checkoutAction } from "@/lib/actions/checkout";
import { validateCouponAction } from "@/lib/actions/coupons";
import { formatDOPFromCents } from "@/lib/format-currency";
import { unitPriceForSelection } from "@/lib/variants";
import type { CartItem, CatalogProduct } from "@/types";

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

/** Valor del selector de ciudad que muestra el campo para escribirla. */
const OTHER_CITY = "__other__";

/** Datos de contacto recordados en este navegador para la próxima compra. */
const CONTACT_STORAGE_KEY = "jw-checkout-contact";
const REMEMBERED_FIELDS = [
  ["name", "checkout-name"],
  ["email", "checkout-email"],
  ["phone", "checkout-phone"],
  ["address", "checkout-address"],
  ["sector", "checkout-sector"],
] as const;

interface SavedContact {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  sector?: string;
  province?: string;
  city?: string;
}

function loadSavedContact(): SavedContact | null {
  try {
    const raw = window.localStorage.getItem(CONTACT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedContact) : null;
  } catch {
    return null;
  }
}

function saveContact(contact: SavedContact): void {
  try {
    window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contact));
  } catch {
    // Navegación privada o almacenamiento bloqueado: no pasa nada.
  }
}

/** Datos públicos de cada tienda que el checkout necesita. */
export interface CheckoutStoreInfo {
  id: string;
  name: string;
  slug: string;
  freeShippingMinCents: number;
}

/** Elecciones del cliente para la parte de una tienda. */
interface StoreChoice {
  shippingId: string | null;
  paymentMethod: PaymentMethod;
  bankAccountId: string | null;
  couponInput: string;
  appliedCoupon: string | null;
  discountCents: number;
  couponError: string | null;
  couponLoading: boolean;
}

interface Confirmation {
  checkoutNumber: string;
  totalCents: number;
  orders: (CheckoutOrderResult & { paymentNote: string })[];
}

function ConfirmationScreen({ confirmation }: { confirmation: Confirmation }) {
  const multi = confirmation.orders.length > 1;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-[14px] border border-border bg-card p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 text-xl font-semibold text-foreground">¡Compra recibida!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Número de compra{" "}
          <span className="font-mono font-semibold text-foreground">#{confirmation.checkoutNumber}</span>. Total:{" "}
          {formatDOPFromCents(confirmation.totalCents)}.
        </p>
        {multi ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Tu compra se dividió en {confirmation.orders.length} pedidos: cada tienda te envía y te cobra lo suyo.
          </p>
        ) : null}
        <Link
          href={`/estado-pedido?pedido=${confirmation.checkoutNumber}`}
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Consultar el estado más tarde
        </Link>
      </div>

      {confirmation.orders.map((o) => (
        <div key={o.orderId} className="rounded-[14px] border border-border bg-card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold text-foreground">
              {o.storeName}{" "}
              <span className="font-mono text-sm font-normal text-muted-foreground">· Pedido #{o.orderNumber}</span>
            </p>
            <p className="font-mono font-semibold tabular-nums">{formatDOPFromCents(o.totalCents)}</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Pago: <span className="font-medium text-foreground">{o.paymentMethodLabel}</span>
          </p>
          {o.paymentMethod === "bank_transfer" && o.bankAccount ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">Transfiere a {o.storeName}</p>
              <BankAccountCard account={o.bankAccount} amountLabel={formatDOPFromCents(o.totalCents)} />
              <p className="text-xs text-muted-foreground">
                Usa <span className="font-mono">#{o.orderNumber}</span> como concepto. {o.paymentNote}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              {o.paymentNote} {o.storeName} te contactará para coordinar la entrega.
            </p>
          )}
          {o.whatsappUrl ? (
            <a
              href={o.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Confirmar con {o.storeName} por WhatsApp
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function CheckoutContent({
  products,
  shippingMethods,
  paymentOptionsByStore,
  stores,
}: {
  products: CatalogProduct[];
  shippingMethods: ShippingMethod[];
  paymentOptionsByStore: Record<string, CheckoutPaymentOptions>;
  stores: CheckoutStoreInfo[];
}) {
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const provinceCities = citiesForProvince(province);
  const resolvedCity = city === OTHER_CITY ? customCity.trim() : city;

  // Rellena el formulario con los datos de la compra anterior (si los hay).
  // biome-ignore lint/correctness/useExhaustiveDependencies: solo al montar / al aparecer el formulario
  useEffect(() => {
    const saved = loadSavedContact();
    if (!saved) return;
    for (const [key, id] of REMEMBERED_FIELDS) {
      const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
      if (el && !el.value && saved[key]) el.value = saved[key];
    }
    if (saved.province && DR_PROVINCES.some((p) => p.name === saved.province)) {
      setProvince(saved.province);
      if (saved.city) {
        if (citiesForProvince(saved.province).includes(saved.city)) {
          setCity(saved.city);
        } else {
          setCity(OTHER_CITY);
          setCustomCity(saved.city);
        }
      }
    }
  }, [items.length > 0]);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const storeMap = useMemo(() => new Map(stores.map((s) => [s.id, s])), [stores]);

  // Partes del carrito por tienda.
  const groups = useMemo(() => {
    const map = new Map<string, { storeId: string; items: CartItem[]; subtotalCents: number }>();
    for (const item of items) {
      const p = productMap.get(item.productId);
      if (!p?.storeId) continue;
      const g = map.get(p.storeId) ?? { storeId: p.storeId, items: [], subtotalCents: 0 };
      g.items.push(item);
      g.subtotalCents += unitPriceForSelection(p, item.size, item.color) * item.quantity;
      map.set(p.storeId, g);
    }
    return [...map.values()];
  }, [items, productMap]);

  const [choices, setChoices] = useState<Record<string, StoreChoice>>({});
  const choiceFor = (storeId: string): StoreChoice => {
    const existing = choices[storeId];
    if (existing) return existing;
    const options = paymentOptionsByStore[storeId];
    const methods = shippingMethods.filter((m) => m.storeId === storeId);
    return {
      shippingId: methods[0]?.id ?? null,
      paymentMethod: options?.methods[0]?.method ?? "cash_on_delivery",
      bankAccountId: options?.bankAccounts.length === 1 ? options.bankAccounts[0].id : null,
      couponInput: "",
      appliedCoupon: null,
      discountCents: 0,
      couponError: null,
      couponLoading: false,
    };
  };
  const updateChoice = (storeId: string, patch: Partial<StoreChoice>) =>
    setChoices((prev) => ({ ...prev, [storeId]: { ...choiceFor(storeId), ...prev[storeId], ...patch } }));

  const parts = groups.map((g) => {
    const c = choiceFor(g.storeId);
    const store = storeMap.get(g.storeId);
    const methods = shippingMethods.filter((m) => m.storeId === g.storeId);
    const selected = methods.find((m) => m.id === c.shippingId) ?? null;
    const freeMin = store?.freeShippingMinCents ?? 0;
    const shippingCents = resolveShippingCents(g.subtotalCents, selected?.priceCents ?? 0, freeMin);
    const discountCents = c.appliedCoupon ? Math.min(c.discountCents, g.subtotalCents) : 0;
    return {
      ...g,
      store,
      choice: c,
      methods,
      freeMin,
      freeShipping: qualifiesForFreeShipping(g.subtotalCents, freeMin),
      shippingCents,
      discountCents,
      totalCents: Math.max(0, g.subtotalCents - discountCents + shippingCents),
      options: paymentOptionsByStore[g.storeId],
    };
  });
  const grandTotal = parts.reduce((a, p) => a + p.totalCents, 0);

  const applyCoupon = async (storeId: string, subtotalCents: number) => {
    const code = choiceFor(storeId).couponInput.trim();
    if (!code) return;
    updateChoice(storeId, { couponLoading: true, couponError: null });
    const res = await validateCouponAction(code, subtotalCents, storeId);
    if (res.valid) {
      updateChoice(storeId, {
        couponLoading: false,
        appliedCoupon: res.code ?? code,
        discountCents: res.discountCents ?? 0,
      });
    } else {
      updateChoice(storeId, {
        couponLoading: false,
        appliedCoupon: null,
        discountCents: 0,
        couponError: res.reason ?? "Cupón no válido.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!province || !resolvedCity) {
      setError("Elige tu provincia y ciudad.");
      return;
    }
    for (const p of parts) {
      if (!p.store) {
        setError("Una de las tiendas de tu carrito ya no está disponible. Quita sus productos para continuar.");
        return;
      }
      if (p.choice.paymentMethod === "bank_transfer" && !p.choice.bankAccountId) {
        setError(`${p.store.name}: elige el banco al que vas a transferir.`);
        return;
      }
    }
    setLoading(true);

    const form = e.currentTarget;
    const value = (id: string) =>
      ((form.querySelector(`#${id}`) as HTMLInputElement | HTMLTextAreaElement | null)?.value ?? "").trim();

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
        addressLine2: value("checkout-sector") || null,
        city: resolvedCity || null,
        state: province || null,
        country: "DO",
      },
      notes: value("checkout-notes") || null,
      stores: parts.map((p) => ({
        storeId: p.storeId,
        shippingMethodId: p.choice.shippingId,
        couponCode: p.choice.appliedCoupon,
        paymentMethod: p.choice.paymentMethod,
        bankAccountId: p.choice.paymentMethod === "bank_transfer" ? p.choice.bankAccountId : null,
      })),
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    saveContact({
      name: value("checkout-name"),
      email: value("checkout-email"),
      phone: value("checkout-phone"),
      address: value("checkout-address"),
      sector: value("checkout-sector"),
      province,
      city: resolvedCity,
    });
    clearCart();
    setConfirmation({
      checkoutNumber: result.result.checkoutNumber,
      totalCents: result.result.totalCents,
      orders: result.result.orders.map((o) => ({
        ...o,
        paymentNote: paymentOptionsByStore[o.storeId]?.methods.find((m) => m.method === o.paymentMethod)?.note ?? "",
      })),
    });
  };

  if (confirmation) return <ConfirmationScreen confirmation={confirmation} />;

  if (items.length === 0) {
    return (
      <div className="rounded-[14px] border border-border bg-card p-12 sm:p-16 text-center">
        <h2 className="text-xl font-semibold text-foreground">No hay productos en el carrito</h2>
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
    <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 xl:gap-12">
      <div className="lg:min-w-0">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Datos de entrega</p>
        <div className="rounded-[14px] border border-border bg-card p-4 sm:p-5 space-y-5">
          <div>
            <label htmlFor="checkout-name" className={labelClass}>
              Nombre completo
            </label>
            <input
              id="checkout-name"
              type="text"
              required
              autoComplete="name"
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
                autoComplete="email"
                inputMode="email"
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
                autoComplete="tel"
                inputMode="tel"
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
              autoComplete="street-address"
              className="w-full rounded-[10px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
              placeholder="Calle, número, referencia..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="checkout-province" className={labelClass}>
                Provincia
              </label>
              <select
                id="checkout-province"
                required
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  const first = citiesForProvince(e.target.value);
                  setCity(first.length === 1 ? first[0] : "");
                  setCustomCity("");
                }}
                autoComplete="address-level1"
                className={inputClass}
              >
                <option value="" disabled>
                  Elige tu provincia
                </option>
                {DR_PROVINCES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="checkout-city-select" className={labelClass}>
                Ciudad / municipio
              </label>
              <select
                id="checkout-city-select"
                required
                disabled={!province}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`${inputClass} disabled:opacity-60`}
              >
                <option value="" disabled>
                  {province ? "Elige tu ciudad" : "Primero la provincia"}
                </option>
                {provinceCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value={OTHER_CITY}>Otra (escribirla)</option>
              </select>
            </div>
          </div>
          {city === OTHER_CITY && (
            <div>
              <label htmlFor="checkout-city-other" className={labelClass}>
                Escribe tu ciudad o municipio
              </label>
              <input
                id="checkout-city-other"
                type="text"
                required
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                autoComplete="address-level2"
                className={inputClass}
                placeholder="Ej. Villa Mella"
              />
            </div>
          )}
          <div>
            <label htmlFor="checkout-sector" className={labelClass}>
              Sector o barrio{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </label>
            <input
              id="checkout-sector"
              type="text"
              autoComplete="address-level3"
              className={inputClass}
              placeholder="Ej. Naco, Los Prados, Gurabo…"
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

        {/* Una sección por tienda: productos, envío, cupón y pago */}
        <div className="mt-8 space-y-6">
          {parts.map((p, idx) => (
            <section key={p.storeId} className="rounded-[14px] border border-border bg-card overflow-hidden" aria-label={`Pedido de ${p.store?.name ?? "tienda"}`}>
              <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
                <p className="text-sm font-semibold text-foreground">
                  {parts.length > 1 ? `Pedido ${idx + 1} · ` : ""}Vendido por{" "}
                  {p.store ? (
                    <Link href={`/tiendas/${p.store.slug}`} className="text-primary hover:underline" target="_blank">
                      {p.store.name}
                    </Link>
                  ) : (
                    "tienda no disponible"
                  )}
                </p>
                <p className="font-mono text-sm font-semibold tabular-nums">{formatDOPFromCents(p.totalCents)}</p>
              </header>

              <ul className="divide-y divide-border">
                {p.items.map((item) => {
                  const product = productMap.get(item.productId);
                  if (!product) return null;
                  const unitCents = unitPriceForSelection(product, item.size, item.color);
                  return (
                    <li key={`${item.productId}:${item.size ?? ""}:${item.color ?? ""}`} className="flex gap-3 px-4 py-3 sm:px-5">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-[10px] bg-muted ring-1 ring-border/50">
                        <Image src={product.coverImage} alt={product.name} fill className="object-cover" sizes="64px" unoptimized={isExternalImage(product.coverImage)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {[item.size, item.color].filter(Boolean).join(" · ")}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground tabular-nums">
                          {formatDOPFromCents(unitCents)} × {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                        {formatDOPFromCents(unitCents * item.quantity)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-5 border-t border-border p-4 sm:p-5">
                {/* Envío */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Envío</p>
                  {p.freeMin > 0 && !p.freeShipping ? (
                    <p className="text-xs text-primary">
                      Te faltan {formatDOPFromCents(remainingForFreeShipping(p.subtotalCents, p.freeMin))} en esta tienda para envío gratis.
                    </p>
                  ) : null}
                  {p.methods.length === 0 ? (
                    <p className="text-xs text-muted-foreground">La tienda coordinará el envío contigo.</p>
                  ) : (
                    p.methods.map((m) => (
                      <label
                        key={m.id}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border p-3 text-sm transition-colors ${
                          p.choice.shippingId === m.id ? "border-primary/60 bg-primary/5" : "border-border"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`shipping-${p.storeId}`}
                            checked={p.choice.shippingId === m.id}
                            onChange={() => updateChoice(p.storeId, { shippingId: m.id })}
                            className="accent-primary"
                          />
                          <span>
                            <span className="font-medium text-foreground">{m.name}</span>
                            {(m.minDays != null || m.maxDays != null) && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({m.minDays ?? "?"}-{m.maxDays ?? "?"} días)
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="font-mono tabular-nums">
                          {p.freeShipping || m.priceCents === 0 ? "Gratis" : formatDOPFromCents(m.priceCents)}
                        </span>
                      </label>
                    ))
                  )}
                </div>

                {/* Pago */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Pago a {p.store?.name ?? "la tienda"}</p>
                  {(p.options?.methods ?? []).map((m) => (
                    <label
                      key={m.method}
                      className={`flex cursor-pointer items-start gap-3 rounded-[10px] border p-3 text-sm transition-colors ${
                        p.choice.paymentMethod === m.method ? "border-primary/60 bg-primary/5" : "border-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`payment-${p.storeId}`}
                        checked={p.choice.paymentMethod === m.method}
                        onChange={() => updateChoice(p.storeId, { paymentMethod: m.method })}
                        className="mt-0.5 accent-primary"
                      />
                      <span>
                        <span className="block font-medium text-foreground">{m.label}</span>
                        <span className="block text-xs text-muted-foreground">{m.note}</span>
                      </span>
                    </label>
                  ))}
                  {p.choice.paymentMethod === "bank_transfer" && p.options ? (
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-wrap gap-2">
                        {p.options.bankAccounts.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => updateChoice(p.storeId, { bankAccountId: b.id })}
                            aria-pressed={p.choice.bankAccountId === b.id}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                              p.choice.bankAccountId === b.id
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:border-primary/60"
                            }`}
                          >
                            {b.bankName}
                          </button>
                        ))}
                      </div>
                      {(() => {
                        const bank = p.options.bankAccounts.find((b) => b.id === p.choice.bankAccountId);
                        return bank ? (
                          <BankAccountCard account={bank} amountLabel={formatDOPFromCents(p.totalCents)} />
                        ) : (
                          <p className="text-xs text-muted-foreground">Elige un banco para ver los datos de la cuenta.</p>
                        );
                      })()}
                    </div>
                  ) : null}
                </div>

                {/* Cupón de la tienda */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Cupón de {p.store?.name ?? "la tienda"}</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={p.choice.couponInput}
                      onChange={(e) => updateChoice(p.storeId, { couponInput: e.target.value.toUpperCase() })}
                      placeholder="CÓDIGO"
                      aria-label={`Cupón de ${p.store?.name ?? "la tienda"}`}
                      className="h-10 flex-1 rounded-[10px] border border-border bg-background px-3 text-sm uppercase placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => applyCoupon(p.storeId, p.subtotalCents)}
                      disabled={p.choice.couponLoading || !p.choice.couponInput.trim()}
                      className="rounded-[10px] border border-border bg-muted/40 px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
                    >
                      {p.choice.couponLoading ? "…" : "Aplicar"}
                    </button>
                  </div>
                  {p.choice.couponError ? <p className="text-xs text-destructive">{p.choice.couponError}</p> : null}
                  {p.choice.appliedCoupon ? (
                    <p className="text-xs font-medium text-primary">
                      Cupón {p.choice.appliedCoupon} aplicado: −{formatDOPFromCents(p.discountCents)}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Resumen */}
      <aside className="mt-8 lg:mt-0 lg:sticky lg:top-28 lg:self-start">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Resumen de la compra</p>
        <div className="rounded-[14px] border border-border bg-card p-5 sm:p-6">
          <dl className="mb-4 space-y-2 text-sm">
            {parts.map((p) => (
              <div key={p.storeId} className="flex justify-between gap-4">
                <dt className="min-w-0 truncate text-muted-foreground">{p.store?.name ?? "Tienda"}</dt>
                <dd className="font-mono tabular-nums">
                  {formatDOPFromCents(p.totalCents)}
                  <span className="block text-right text-[11px] text-muted-foreground">
                    envío {p.shippingCents === 0 ? "gratis" : formatDOPFromCents(p.shippingCents)}
                    {p.discountCents > 0 ? ` · −${formatDOPFromCents(p.discountCents)}` : ""}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <div className="mb-4 flex items-baseline justify-between gap-4 border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-mono text-xl font-bold tabular-nums text-primary">{formatDOPFromCents(grandTotal)}</span>
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
            {loading ? "Enviando…" : parts.length > 1 ? `Confirmar ${parts.length} pedidos` : "Confirmar pedido"}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {parts.length > 1
              ? "Cada tienda recibe su pedido, te cobra su parte y coordina la entrega contigo."
              : "Al confirmar recibirás tu número de pedido. La tienda te contactará para coordinar la entrega."}
          </p>
        </div>
      </aside>
    </form>
  );
}
