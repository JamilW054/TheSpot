"use client";

import { useCart } from "@/contexts/cart-context";
import type { CatalogProduct } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function CheckoutContent({ products }: { products: CatalogProduct[] }) {
  const { items, itemCount, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const productMap = new Map(products.map((p) => [p.id, p]));
  let totalCents = 0;
  items.forEach((item) => {
    const p = productMap.get(item.productId);
    if (p) totalCents += p.priceCents * item.quantity;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
    clearCart();
  };

  if (items.length === 0 && !submitted) {
    return (
      <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">No hay productos en el carrito.</p>
        <Link
          href="/catalogo"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Pedido recibido</h2>
        <p className="mt-2 text-muted-foreground">
          Gracias por tu compra. Te hemos enviado un correo de confirmación (simulado).
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Seguir comprando
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Datos de envío</h2>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div>
            <label htmlFor="checkout-name" className="block text-sm font-medium text-foreground">
              Nombre completo
            </label>
            <input
              id="checkout-name"
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label htmlFor="checkout-email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="checkout-email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label htmlFor="checkout-address" className="block text-sm font-medium text-foreground">
              Dirección
            </label>
            <textarea
              id="checkout-address"
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
              placeholder="Calle, número, código postal, ciudad"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Resumen del pedido</h2>
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
          {items.map((item) => {
            const product = productMap.get(item.productId);
            if (!product) return null;
            return (
              <li key={`${item.productId}:${item.designId ?? ""}`} className="flex gap-4 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                  src={product.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized={product.coverImage?.includes("placehold.co") ?? false}
                />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.price} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-foreground">
                  {((product.priceCents * item.quantity) / 100).toFixed(2).replace(".", ",")} €
                </p>
              </li>
            );
          })}
        </ul>
        <p className="text-right text-lg font-semibold text-foreground">
          Total: {(totalCents / 100).toFixed(2).replace(".", ",")} €
        </p>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-base font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Procesando…" : "Confirmar pedido"}
        </button>
      </div>
    </form>
  );
}
