import Link from "next/link";
import { Suspense } from "react";
import { CatalogCategoryNav } from "@/components/catalog/CatalogCategoryNav";
import { CatalogFilterChips } from "@/components/catalog/CatalogFilterChips";
import { CatalogFiltersToggleButton } from "@/components/catalog/CatalogFiltersToggleButton";
import { CatalogMobileFilters } from "@/components/catalog/CatalogMobileFilters";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { CatalogSidebar } from "@/components/catalog/CatalogSidebar";
import { CatalogSupabaseDebugLog } from "@/components/catalog/CatalogSupabaseDebugLog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CatalogFiltersVisibilityProvider } from "@/contexts/catalog-filters-visibility-context";
import {
  getCategoriesPublic,
  getCategoryCoverByCategoryId,
  getProducts,
  getPublishedCatalogColors,
  getPublishedCatalogTags,
} from "@/database/repositories";
import { catalogFiltersFromRecord } from "@/lib/catalog-query";

export const dynamic = "force-dynamic";
const PRODUCTS_PER_PAGE = 24;

export const metadata = {
  title: "Catálogo | JW PARFUM",
  description: "Ropa a la venta. Añade al carrito o consulta cada producto.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = catalogFiltersFromRecord(raw);
  const requestedPageValue = Array.isArray(raw.pagina)
    ? raw.pagina[0]
    : raw.pagina;
  const requestedPage = Math.max(
    1,
    Number.parseInt(requestedPageValue ?? "1", 10) || 1,
  );

  const [products, categories, covers, tagOptions, colorOptions] =
    await Promise.all([
      getProducts({
        categorySlug: filters.categoria,
        orden: filters.orden,
        etiqueta: filters.etiqueta,
        precio: filters.precio,
        color: filters.color,
        busqueda: filters.busqueda,
      }),
      getCategoriesPublic(),
      getCategoryCoverByCategoryId(),
      getPublishedCatalogTags(),
      getPublishedCatalogColors(),
    ]);

  const activeCategory = filters.categoria
    ? categories.find((c) => c.slug === filters.categoria)
    : undefined;
  const totalProducts = products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  return (
    <article className="w-full pb-16">
      <CatalogSupabaseDebugLog
        products={products}
        categoriesCount={categories.length}
      />

      <Suspense fallback={null}>
        <CatalogMobileFilters
          categories={categories}
          coverByCategoryId={covers}
          filters={filters}
          tagOptions={tagOptions}
          colorOptions={colorOptions}
        />
      </Suspense>

      <CatalogCategoryNav
        categories={categories}
        coverByCategoryId={covers}
        activeCategoryId={activeCategory?.id}
      />

      {/* Sidebar (desktop, colapsable) + contenido */}
      <CatalogFiltersVisibilityProvider>
        <div className="flex w-full px-3 sm:px-6 lg:px-8">
          <CatalogSidebar
            categories={categories}
            coverByCategoryId={covers}
            filters={filters}
            tagOptions={tagOptions}
            colorOptions={colorOptions}
          />
          <CatalogFiltersToggleButton />

          <div className="min-w-0 flex-1">
            {/* Header + filter chips */}
            <div className="pb-3 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h1 className="min-w-0 truncate text-base font-bold tracking-tight text-foreground sm:text-lg">
                  {filters.busqueda
                    ? `"${filters.busqueda}"`
                    : (activeCategory?.name ?? "Todo el catálogo")}
                </h1>
                <p className="tabular-nums text-xs font-medium text-muted-foreground">
                  {totalProducts} {totalProducts === 1 ? "pieza" : "piezas"}
                </p>
              </div>
              <CatalogFilterChips
                filters={filters}
                categoryName={activeCategory?.name}
              />
            </div>

            {/* Product grid — auto-fill en lg+: se acomoda solo al ancho
                disponible (colapsar el sidebar o una pantalla más ancha
                agrandan las tarjetas sin recalcular nada por JS). */}
            <section
              id="lista-productos"
              aria-label="Productos"
              className="grid grid-cols-2 gap-2.5 min-[480px]:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] lg:gap-5 pb-16"
            >
              {totalProducts === 0 ? (
                <p className="col-span-full rounded-xl border border-dashed border-border/90 bg-muted/20 px-4 py-14 text-center text-sm text-muted-foreground">
                  No hay productos que coincidan.{" "}
                  <Link
                    href="/catalogo"
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    Ver todo
                  </Link>
                </p>
              ) : null}
              {pageProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </section>
            <CatalogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              query={raw}
            />
          </div>
        </div>
      </CatalogFiltersVisibilityProvider>
    </article>
  );
}
