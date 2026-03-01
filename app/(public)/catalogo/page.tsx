import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { CatalogProductViewerWithDesign } from "@/components/catalog/CatalogProductViewerWithDesign";
import { CatalogSupabaseDebugLog } from "@/components/catalog/CatalogSupabaseDebugLog";
import { getDesignById } from "@/lib/db";
import { getProducts } from "@/lib/db";
import Link from "next/link";
import type { Design } from "@/types";

export const metadata = {
  title: "Catálogo | Buxxep",
  description: "Ropa a la venta. Personaliza tu prenda en el editor 3D o diseña desde cero.",
};

export default async function CatalogPage() {
  const products = await getProducts();
  const designIds = [...new Set(products.map((p) => p.defaultDesignId).filter(Boolean))] as string[];
  const designResults = await Promise.all(designIds.map((id) => getDesignById(id)));
  const designById = new Map<string, Design>();
  designIds.forEach((id, i) => {
    const d = designResults[i];
    if (d) designById.set(id, d);
  });

  const designsByKey = Object.fromEntries(designById);

  return (
    <article className="w-full max-w-5xl mx-auto px-8 sm:px-10 lg:px-12 pt-2 pb-10">
      <CatalogSupabaseDebugLog products={products} designsByKey={designsByKey} />
      <section className="mb-4 sm:mb-6 text-center" aria-labelledby="catalog-title">
        <h1 id="catalog-title" className="text-2xl font-bold tracking-tight sm:text-4xl text-foreground">
          Catálogo
        </h1>
        <p className="mt-1 sm:mt-1.5 max-w-xl mx-auto text-sm text-muted-foreground">
          Personaliza tu prenda en el editor 3D.
        </p>
      </section>

      <section aria-label="Productos" className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <Link
              href={`/catalogo/${product.slug}`}
              className="relative flex aspect-square overflow-hidden bg-muted transition-transform duration-300 hover:scale-[1.02] min-h-[200px]"
            >
              <div className="relative h-full w-full min-h-0">
                <CatalogProductViewerWithDesign
                  key={product.id}
                  product={product}
                  design={product.defaultDesignId ? (designById.get(product.defaultDesignId) ?? null) : null}
                  compact
                />
              </div>
              <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 rounded-full bg-background/90 px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-foreground">
                {product.price}
              </span>
            </Link>
            <div className="flex flex-1 flex-col p-3 sm:p-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground leading-tight">
                <Link href={`/catalogo/${product.slug}`} className="hover:underline line-clamp-2">
                  {product.name}
                </Link>
              </h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                <AddToCartButton productId={product.id} variant="primary" className="inline-flex shrink-0 text-xs sm:text-sm whitespace-nowrap" />
                <Link
                  href={`/catalogo/${product.slug}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-transparent px-2 py-2 sm:px-4 text-xs sm:text-sm font-medium hover:bg-muted whitespace-nowrap"
                >
                  Ver
                </Link>
                <Link
                  href={product.defaultDesignId ? `/editor?copy=${product.defaultDesignId}&product=${product.id}` : `/editor?product=${product.id}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-transparent px-2 py-2 sm:px-4 text-xs sm:text-sm font-medium hover:bg-muted whitespace-nowrap"
                >
                  {product.defaultDesignId ? "Usar plantilla" : "Diseñar"}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </article>
  );
}
