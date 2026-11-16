import Link from "next/link";
import { getProducts, getShippingMethods } from "@/database/repositories";
import { getCheckoutPaymentOptionsByStore } from "@/database/repositories/payments";
import { getStoresCheckoutInfo } from "@/database/repositories/stores";
import { CheckoutContent } from "./CheckoutContent";

export const metadata = {
  title: "Checkout",
  description: "Finaliza tu pedido. Introduce tus datos de envío y confirma.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [products, shippingMethods] = await Promise.all([getProducts(), getShippingMethods()]);
  // Tiendas presentes en el catálogo: opciones de pago y envío gratis de cada una.
  const storeIds = [...new Set(products.map((p) => p.storeId).filter((x): x is string => Boolean(x)))];
  const [paymentOptionsByStore, storeInfo] = await Promise.all([
    getCheckoutPaymentOptionsByStore(storeIds),
    getStoresCheckoutInfo(storeIds),
  ]);
  const stores = [...storeInfo.values()].map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    freeShippingMinCents: s.freeShippingMinCents ?? 0,
  }));
  return (
    <article className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-16 sm:pb-20">
      <nav className="mb-4 sm:mb-5" aria-label="Navegación">
        <Link
          href="/carrito"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className="size-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al carrito
        </Link>
      </nav>

      <header className="mb-6 sm:mb-8" aria-labelledby="checkout-title">
        <h1
          id="checkout-title"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
        >
          Finalizar pedido
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Introduce tus datos de entrega y elige cómo quieres pagar: contra
          entrega o transferencia bancaria. Si compras en varias tiendas, cada una
          recibe y te cobra su parte.
        </p>
      </header>

      <CheckoutContent
        products={products}
        shippingMethods={shippingMethods}
        paymentOptionsByStore={paymentOptionsByStore}
        stores={stores}
      />
    </article>
  );
}
