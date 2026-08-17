import Link from "next/link";
import { getProducts, getShippingMethods } from "@/database/repositories";
import { CheckoutContent } from "./CheckoutContent";

export const metadata = {
  title: "Checkout | JW PARFUM",
  description: "Finaliza tu pedido. Introduce tus datos de envío y confirma.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [products, shippingMethods] = await Promise.all([
    getProducts(),
    getShippingMethods(),
  ]);
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
          Introduce tus datos de entrega. No se realiza ningún cobro en línea:
          confirmamos el pedido contigo por WhatsApp o correo.
        </p>
      </header>

      <CheckoutContent products={products} shippingMethods={shippingMethods} />
    </article>
  );
}
