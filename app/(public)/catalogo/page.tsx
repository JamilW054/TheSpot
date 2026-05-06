import Link from "next/link";
import { Suspense } from "react";
import { AdminEditorLink } from "@/components/auth";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { CatalogCatalogSubnav } from "@/components/catalog/CatalogCatalogSubnav";
import { CatalogFilterChips } from "@/components/catalog/CatalogFilterChips";
import { CatalogProductViewerWithDesign } from "@/components/catalog/CatalogProductViewerWithDesign";
import { CatalogMobileFilters } from "@/components/catalog/CatalogMobileFilters";
import { CatalogSidebar } from "@/components/catalog/CatalogSidebar";
import { CatalogSupabaseDebugLog } from "@/components/catalog/CatalogSupabaseDebugLog";
import { catalogFiltersFromRecord } from "@/lib/catalog-query";
import {
  getCategoriesPublic,
  getCategoryCoverByCategoryId,
  getProducts,
  getPublishedCatalogTags,
} from "@/lib/db";

/** Siempre consultar Supabase en cada visita (categorías y productos no vienen de mocks ni build estático). */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo | Buxxep",
  description: "Ropa a la venta. Añade al carrito o consulta cada producto.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = catalogFiltersFromRecord(raw);

  const [products, categories, covers, tagOptions] = await Promise.all([
    getProducts({
      categorySlug: filters.categoria,
      orden: filters.orden,
      etiqueta: filters.etiqueta,
      precio: filters.precio,
    }),
    getCategoriesPublic(),
    getCategoryCoverByCategoryId(),
    getPublishedCatalogTags(),
  ]);

  const activeCategory = filters.categoria
    ? categories.find((c) => c.slug === filters.categoria)
    : undefined;

  const heroTitle = activeCategory?.name ?? "Catálogo";

  return (
    <article className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
      <CatalogSupabaseDebugLog products={products} categoriesCount={categories.length} />

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10 lg:items-start">
        <Suspense fallback={null}>
          <CatalogMobileFilters
            categories={categories}
            coverByCategoryId={covers}
            filters={filters}
            tagOptions={tagOptions}
          />
        </Suspense>
        <CatalogSidebar
          categories={categories}
          coverByCategoryId={covers}
          filters={filters}
          tagOptions={tagOptions}
        />

        <div className="min-w-0 flex-1">
          <header className="mb-6 border-b border-border/80 pb-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/90">
                  Buxxep · Tienda
                </p>
                <h1
                  id="catalog-title"
                  className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-[2rem] lg:leading-tight"
                >
                  {heroTitle}
                </h1>
              </div>
              <p className="tabular-nums text-sm font-medium text-muted-foreground">
                {products.length}{" "}
                {products.length === 1 ? "pieza" : "piezas"}
              </p>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              {activeCategory ? (
                <>
                  Estás viendo esta línea. Usa orden, precio o etiquetas en los filtros
                  (botón «Filtros» en el móvil) para afinar resultados.
                </>
              ) : (
                <>
                  Explora por categoría, rango de precio y etiquetas reales de tus productos
                  en Supabase.
                </>
              )}
            </p>
          </header>

          <CatalogFilterChips filters={filters} categoryName={activeCategory?.name} />

          <Suspense
            fallback={
              <div
                className="mb-8 h-10 max-w-lg rounded-lg bg-muted/70 animate-pulse"
                aria-hidden
              />
            }
          >
            <CatalogCatalogSubnav />
          </Suspense>

          <section
            id="lista-productos"
            aria-label="Productos"
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {products.length === 0 ? (
              <p className="col-span-full rounded-xl border border-dashed border-border/90 bg-muted/20 px-4 py-14 text-center text-sm text-muted-foreground">
                No hay productos que coincidan con esta vista. Ajusta filtros o vuelve al{" "}
                <Link
                  href="/catalogo"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  catálogo completo
                </Link>
                .
              </p>
            ) : null}
            {products.map((product) => (
              <article
                key={product.id}
                className="group/card flex flex-col overflow-hidden rounded-xl border border-border/90 bg-card shadow-[0_12px_40px_-28px_rgba(0,0,0,0.55)] transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_20px_48px_-24px_rgba(60,200,247,0.18)]"
              >
                <Link
                  href={`/catalogo/${product.slug}`}
                  className="relative flex aspect-square min-h-[180px] overflow-hidden bg-linear-to-b from-muted/80 to-muted transition-transform duration-300 group-hover/card:scale-[1.02]"
                >
                  <div className="relative h-full w-full min-h-0">
                    <CatalogProductViewerWithDesign
                      product={product}
                      design={null}
                      compact
                    />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col gap-2 border-t border-border/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 text-base font-semibold leading-snug text-card-foreground">
                      <Link
                        href={`/catalogo/${product.slug}`}
                        className="line-clamp-2 hover:text-primary hover:underline decoration-primary/40 underline-offset-2"
                      >
                        {product.name}
                      </Link>
                    </h2>
                    <span className="shrink-0 tabular-nums text-base font-bold tracking-tight text-primary">
                      {product.price}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:text-[13px]">
                    {product.description}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <AddToCartButton
                      productId={product.id}
                      variant="primary"
                      className="inline-flex shrink-0 rounded-lg text-xs sm:text-sm"
                    />
                    <Link
                      href={`/catalogo/${product.slug}`}
                      className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border/90 bg-transparent px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted/60 sm:text-sm"
                    >
                      Ver
                    </Link>
                    <AdminEditorLink
                      href={`/editor?product=${product.id}`}
                      className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border/90 bg-transparent px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted/60 sm:text-sm"
                    >
                      Diseñar
                    </AdminEditorLink>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </article>
  );
}
