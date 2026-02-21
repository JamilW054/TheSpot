import { getProducts } from "@/lib/db";
import { CartContent } from "./CartContent";
import Link from "next/link";

export const metadata = {
  title: "Carrito | Buxxep",
  description: "Tu carrito de compra. Revisa los productos y finaliza tu pedido.",
};

export default async function CartPage() {
  const products = await getProducts();
  return (
    <article className="min-h-[80vh]">
      <section className="mb-8" aria-labelledby="cart-title">
        <h1 id="cart-title" className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
          Carrito
        </h1>
        <p className="mt-1 text-muted-foreground">
          Revisa los productos y continúa al checkout cuando quieras.
        </p>
      </section>
      <CartContent products={products} />
      <p className="mt-6">
        <Link href="/catalogo" className="text-sm font-medium text-primary hover:underline">
          Seguir comprando
        </Link>
      </p>
    </article>
  );
}
