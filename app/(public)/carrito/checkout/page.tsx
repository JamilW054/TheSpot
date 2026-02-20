import { MOCK_CATALOG_PRODUCTS } from "@/config/mock-data";
import { CheckoutContent } from "./CheckoutContent";
import Link from "next/link";

export const metadata = {
  title: "Checkout | Buxxep",
  description: "Finaliza tu pedido.",
};

export default function CheckoutPage() {
  return (
    <article className="min-h-[80vh]">
      <section className="mb-8" aria-labelledby="checkout-title">
        <h1 id="checkout-title" className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          Finalizar compra
        </h1>
        <p className="mt-1 text-muted-foreground">
          Revisa el resumen e introduce tus datos para completar el pedido.
        </p>
      </section>
      <CheckoutContent products={MOCK_CATALOG_PRODUCTS} />
      <p className="mt-6">
        <Link href="/carrito" className="text-sm font-medium text-primary hover:underline">
          Volver al carrito
        </Link>
      </p>
    </article>
  );
}
