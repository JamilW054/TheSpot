import Link from "next/link";
import { Suspense } from "react";
import { AdminEditorLink } from "@/components/auth";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { CatalogCatalogSubnav } from "@/components/catalog/CatalogCatalogSubnav";
import { CatalogCategoryGrid } from "@/components/catalog/CatalogCategoryGrid";
import { CatalogProductViewerWithDesign } from "@/components/catalog/CatalogProductViewerWithDesign";
import { CatalogSupabaseDebugLog } from "@/components/catalog/CatalogSupabaseDebugLog";
import {
  getCategoriesPublic,
  getCategoryCoverByCategoryId,
  getProducts,
} from "@/lib/db";

export const metadata = {
  title: "Catálogo | Buxxep",
  description: "Ropa a la venta. Añade al carrito o consulta cada producto.",
};

interface PageProps {
  searchParams: Promise<{ categoria?: string; orden?: string }>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const { categoria, orden } = await searchParams;
  const sort = orden === "recientes" ? "recientes" : "catalog";
  const slug = categoria?.trim();

  const [products, categories, covers] = await Promise.all([
    getProducts({
      categorySlug: slug || undefined,
      sort,
    }),
    getCategoriesPublic(),
    getCategoryCoverByCategoryId(),
  ]);

  const activeCategory = slug
    ? categories.find((c) => c.slug === slug)
    : undefined;

  return (
    <article className="w-full max-w-5xl mx-auto px-8 sm:px-10 lg:px-12 pt-2 pb-10">
      <CatalogSupabaseDebugLog products={products} />
      <section
        className="mb-4 sm:mb-6 text-center"
        aria-labelledby="catalog-title"
      >
        <h1
          id="catalog-title"
          className="text-2xl font-bold tracking-tight sm:text-4xl text-foreground"
        >
          Catálogo
        </h1>
        <p className="mt-1 sm:mt-1.5 max-w-xl mx-auto text-sm text-muted-foreground">
          {activeCategory ? (
            <>
              Mostrando{" "}
              <span className="font-medium text-foreground">
                {activeCategory.name}
              </span>
              . Elige otro apartado o vuelve al listado completo.
            </>
          ) : (
            <>Elige un producto y complétalo en el carrito.</>
          )}
        </p>
      </section>

      {categories.length > 0 ? (
        <CatalogCategoryGrid
          categories={categories}
          coverByCategoryId={covers}
          activeSlug={slug}
          orden={orden}
        />
      ) : null}

      <Suspense
        fallback={
          <div
            className="h-11 mb-6 sm:mb-8 max-w-lg rounded-full bg-muted/70 animate-pulse"
            aria-hidden
          />
        }
      >
        <CatalogCatalogSubnav />
      </Suspense>

      <section
        id="lista-productos"
        aria-label="Productos"
        className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {products.length === 0 ? (
          <p className="col-span-full text-center text-sm text-muted-foreground py-10 sm:py-14 border border-dashed border-border rounded-xl bg-muted/30">
            No hay productos que coincidan con esta vista. Prueba otra categoría o vuelve a{" "}
            <Link href="/catalogo" className="font-medium text-primary underline underline-offset-2">
              ver todo el catálogo
            </Link>
            .
          </p>
        ) : null}
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
                  design={null}
                  compact
                />
              </div>
              <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 rounded-full bg-background/90 px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-foreground">
                {product.price}
              </span>
            </Link>
            <div className="flex flex-1 flex-col p-3 sm:p-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground leading-tight">
                <Link
                  href={`/catalogo/${product.slug}`}
                  className="hover:underline line-clamp-2"
                >
                  {product.name}
                </Link>
              </h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
                <AddToCartButton
                  productId={product.id}
                  variant="primary"
                  className="inline-flex shrink-0 text-xs sm:text-sm whitespace-nowrap"
                />
                <Link
                  href={`/catalogo/${product.slug}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-transparent px-2 py-2 sm:px-4 text-xs sm:text-sm font-medium hover:bg-muted whitespace-nowrap"
                >
                  Ver
                </Link>
                <AdminEditorLink
                  href={`/editor?product=${product.id}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-transparent px-2 py-2 sm:px-4 text-xs sm:text-sm font-medium hover:bg-muted whitespace-nowrap"
                >
                  Diseñar
                </AdminEditorLink>
              </div>
            </div>
          </article>
        ))}
      </section>
    </article>
  );
}
