import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getProducts } from "@/database/repositories";

/**
 * Vitrina de catálogo para las páginas de resultado de pago (éxito, rechazo,
 * cancelación): muestra los productos más recientes e invita a seguir
 * comprando. Server component — trae los productos en el propio render.
 */
export async function PaymentCatalogShowcase({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const products = (await getProducts({ orden: "recientes" })).slice(0, 4);
  if (products.length === 0) return null;

  return (
    <section aria-label="Sigue explorando el catálogo" className="mt-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <Link
          href="/catalogo"
          className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:inline-flex"
        >
          Ver todo el catálogo <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div className="mt-7 text-center">
        <Link
          href="/catalogo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Explorar todo el catálogo
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
