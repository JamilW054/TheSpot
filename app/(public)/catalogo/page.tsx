import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { CatalogProductViewer } from "@/components/catalog/CatalogProductViewer";
import { CATALOG_3D_MODEL } from "@/config/catalog";
import { getProducts } from "@/lib/db";
import Link from "next/link";

export const metadata = {
  title: "Catálogo | Buxxep",
  description: "Ropa a la venta. Personaliza tu prenda en el editor 3D o diseña desde cero.",
};

export default async function CatalogPage() {
  const products = await getProducts();
  return (
    <article className="min-h-[80vh]">
      <section className="mb-10 text-center" aria-labelledby="catalog-title">
        <h1 id="catalog-title" className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
          Catálogo
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
          Ropa a la venta. Cada prenda se puede personalizar en el editor: vincula un diseño o crea el tuyo desde cero.
        </p>
      </section>

      <section aria-label="Productos" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <Link
              href={`/catalogo/${product.slug}`}
              className="relative flex aspect-square overflow-hidden bg-muted transition-transform duration-300 hover:scale-[1.02]"
            >
              <div className="relative h-full w-full">
                <CatalogProductViewer
                  key={product.id}
                  modelPath={CATALOG_3D_MODEL}
                  textureUrl={product.baseTextureUrl ?? (product.coverImage || null)}
                  compact
                />
              </div>
              <span className="absolute bottom-3 right-3 rounded-full bg-background/90 px-3 py-1 text-sm font-medium text-foreground">
                {product.price}
              </span>
            </Link>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-lg font-semibold text-foreground">
                <Link href={`/catalogo/${product.slug}`} className="hover:underline">
                  {product.name}
                </Link>
              </h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <AddToCartButton productId={product.id} variant="primary" />
                <Link
                  href={`/catalogo/${product.slug}`}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Ver
                </Link>
                <Link
                  href={product.defaultDesignId ? `/editor?copy=${product.defaultDesignId}&product=${product.id}` : `/editor?product=${product.id}`}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-muted"
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
