import Image from "next/image";
import Link from "next/link";
import { getProducts, getShippingMethods } from "@/database/repositories";
import { CartContent } from "./CartContent";

export const metadata = {
  title: "Carrito | JW PARFUM",
  description:
    "Tu carrito de compra. Revisa los productos y finaliza tu pedido.",
};

export default async function CartPage() {
  const [products, shippingMethods] = await Promise.all([
    getProducts(),
    getShippingMethods(),
  ]);

  const featured = products.slice(0, 8);

  return (
    <article className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-28 sm:pb-32 lg:pb-20">
      <nav className="mb-4 sm:mb-5" aria-label="Navegación">
        <Link
          href="/catalogo"
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
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al catálogo
        </Link>
      </nav>

      <header className="mb-6 sm:mb-8">
        <h1
          id="cart-title"
          className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          Carrito
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Revisa tu pedido y continúa al checkout de forma segura.
        </p>
      </header>

      <CartContent products={products} shippingMethods={shippingMethods} />

      {/* Recommended products */}
      {featured.length > 0 && (
        <section
          className="mt-16 border-t border-border pt-10"
          aria-labelledby="rec-title"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2
              id="rec-title"
              className="text-lg font-bold tracking-tight text-foreground sm:text-xl"
            >
              También te puede gustar
            </h2>
            <Link
              href="/catalogo"
              className="shrink-0 text-xs font-semibold text-primary hover:underline underline-offset-2"
            >
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/catalogo/${product.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-[0_8px_32px_-12px_rgba(60,200,247,0.22)]"
              >
                <div className="relative aspect-3/4 overflow-hidden bg-muted">
                  <Image
                    src={product.coverImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized={product.coverImage?.startsWith("http")}
                  />
                </div>
                <div className="flex flex-col gap-1 border-t border-border/60 p-2.5 sm:p-3">
                  <span className="text-xs font-semibold leading-tight text-card-foreground line-clamp-1 sm:text-sm group-hover:text-primary transition-colors">
                    {product.name}
                  </span>
                  <span className="font-mono tabular-nums text-sm font-bold text-primary">
                    {product.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
