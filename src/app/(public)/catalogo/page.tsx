import Link from "next/link";
import { Suspense } from "react";
import { CatalogCategoryNav } from "@/components/catalog/CatalogCategoryNav";
import { CatalogFilterChips } from "@/components/catalog/CatalogFilterChips";
import { CatalogFiltersToggleButton } from "@/components/catalog/CatalogFiltersToggleButton";
import { CatalogMobileFilters } from "@/components/catalog/CatalogMobileFilters";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { CatalogSidebar } from "@/components/catalog/CatalogSidebar";
import { CatalogSupabaseDebugLog } from "@/components/catalog/CatalogSupabaseDebugLog";
import { ComingSoonPanel } from "@/components/catalog/ComingSoonPanel";
import { ProductCard } from "@/components/catalog/ProductCard";
import { isComingSoonCategory } from "@/config/brand";
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
/** Slugs de categoría donde no se ofrece el filtro por color. */
const CATEGORIES_WITHOUT_COLOR_FILTER = ["perfumes"];
const PRODUCTS_PER_PAGE = 24;

export const metadata = {
  title: "Catálogo",
  description:
    "Perfumes y tenis ahora. Belleza, relojes y gorras: coming soon.",
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

  const [products, categories, covers, tagOptions, allColorOptions] =
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

  const soonSlugs = categories.filter((c) => c.coming_soon).map((c) => c.slug);
  const activeCategory = filters.categoria
    ? categories.find((c) => c.slug === filters.categoria)
    : undefined;
  const comingSoon = isComingSoonCategory(filters.categoria, soonSlugs);
  // En categorías como Perfumes el color no aplica: no se muestra ese filtro.
  const colorOptions = CATEGORIES_WITHOUT_COLOR_FILTER.includes(
    filters.categoria ?? "",
  )
    ? []
    : allColorOptions;
  const visibleProducts = comingSoon
    ? []
    : products.filter((p) => !isComingSoonCategory(p.categorySlug, soonSlugs));
  const totalProducts = visibleProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageProducts = visibleProducts.slice(
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
            <div className="pb-4 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Catálogo
              </p>
              <div className="mt-1 mb-3 flex flex-wrap items-end justify-between gap-2">
                <h1 className="min-w-0 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {filters.busqueda
                    ? `“${filters.busqueda}”`
                    : (activeCategory?.name ?? "Todo el mix")}
                </h1>
                <p className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold tabular-nums text-primary">
                  {comingSoon
                    ? "Coming soon"
                    : `${totalProducts} ${totalProducts === 1 ? "pieza" : "piezas"}`}
                </p>
              </div>
              <CatalogFilterChips
                filters={filters}
                categoryName={activeCategory?.name}
              />
            </div>

            <section
              id="lista-productos"
              aria-label="Productos"
              className="grid grid-cols-2 gap-3 min-[480px]:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] lg:gap-5 pb-16"
            >
              {comingSoon ? (
                <ComingSoonPanel name={activeCategory?.name} />
              ) : totalProducts === 0 ? (
                <div className="col-span-full rounded-[1.5rem] border border-dashed border-rose-200 bg-[#fff8f9] px-4 py-16 text-center">
                  <p className="text-base font-bold text-foreground">
                    Nada por aquí todavía
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                    Prueba otra categoría o limpia los filtros.
                  </p>
                  <Link
                    href="/catalogo"
                    className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Ver todo
                  </Link>
                </div>
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
