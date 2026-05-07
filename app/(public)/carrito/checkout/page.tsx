import { getProducts } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { CheckoutContent } from "./CheckoutContent";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Checkout | Buxxep",
  description: "Finaliza tu pedido. Introduce tus datos de envío y confirma.",
};

/** Evita caché: siempre comprobar sesión en el servidor. */
export const dynamic = "force-dynamic";

const CHECKOUT_PATH = "/carrito/checkout";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(CHECKOUT_PATH)}`);
  }
  const products = await getProducts();
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
          Finalizar compra
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-lg">
          Introduce tus datos de envío y confirma el pedido.
        </p>
      </header>

      <CheckoutContent products={products} />
    </article>
  );
}
