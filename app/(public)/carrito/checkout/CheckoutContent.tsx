"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createOrderAction } from "@/app/(public)/carrito/checkout/actions";
import { useCart } from "@/contexts/cart-context";
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
  "mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

const labelClass = "block text-sm font-medium text-foreground";

export function CheckoutContent({ products }: { products: CatalogProduct[] }) {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productMap = new Map(products.map((p) => [p.id, p]));
  let totalCents = 0;
  items.forEach((item) => {
    const p = productMap.get(item.productId);
    if (p) totalCents += p.priceCents * item.quantity;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const checkoutForm = e.currentTarget;
    const shipping = {
      name: (
        checkoutForm.querySelector("#checkout-name") as HTMLInputElement
      ).value.trim(),
      email: (
        checkoutForm.querySelector("#checkout-email") as HTMLInputElement
      ).value.trim(),
      address: (
        checkoutForm.querySelector("#checkout-address") as HTMLTextAreaElement
      ).value.trim(),
      phone: (
        checkoutForm.querySelector("#checkout-phone") as HTMLInputElement
      )?.value?.trim(),
      city: (
        checkoutForm.querySelector("#checkout-city") as HTMLInputElement
      )?.value?.trim(),
      postalCode: (
        checkoutForm.querySelector("#checkout-postal") as HTMLInputElement
      )?.value?.trim(),
      country: (
        checkoutForm.querySelector("#checkout-country") as HTMLInputElement
      )?.value?.trim(),
    };
    const orderItems = items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      designId: it.designId ?? null,
      size: it.size ?? null,
    }));
    const result = await createOrderAction(shipping, orderItems);
    setLoading(false);
    if (result.ok) {
      const redirectForm = document.createElement("form");
      redirectForm.method = "POST";
      redirectForm.action = "/api/pagos/azul/enviar";
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "orderId";
      input.value = result.orderId;
      redirectForm.appendChild(input);
      document.body.appendChild(redirectForm);
      redirectForm.submit();
      return;
    }
    setError(result.error);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 sm:p-16 text-center shadow-sm">
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
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow"
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
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6 space-y-5">
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
          <div>
            <label htmlFor="checkout-address" className={labelClass}>
              Dirección
            </label>
            <textarea
              id="checkout-address"
              required
              rows={3}
              className={inputClass}
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
                placeholder="28001"
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
                placeholder="Madrid"
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
                placeholder="España"
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
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resumen del pedido — sticky en desktop */}
      <aside className="mt-8 lg:mt-0 lg:sticky lg:top-28 lg:self-start">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Resumen del pedido
        </p>
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
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
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border/50">
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
                    <p className="font-semibold text-foreground">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {product.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums text-foreground shrink-0">
                    {formatDOPFromCents(lineTotal)}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold tabular-nums text-primary">
                {formatDOPFromCents(totalCents)}
              </span>
            </div>
            {error && (
              <p className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:shadow disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Procesando…" : "Pagar con AZUL"}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Serás redirigido al pago seguro de Banco Popular (AZUL). Al
              confirmar aceptas el pedido.
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
