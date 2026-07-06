import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogFilterChips } from "@/components/catalog/CatalogFilterChips";
import { CatalogMobileFilters } from "@/components/catalog/CatalogMobileFilters";
import { CatalogSidebar } from "@/components/catalog/CatalogSidebar";
import { CatalogSupabaseDebugLog } from "@/components/catalog/CatalogSupabaseDebugLog";
import { ProductCard } from "@/components/catalog/ProductCard";
import {
  getCategoriesPublic,
  getCategoryCoverByCategoryId,
  getProducts,
  getPublishedCatalogColors,
  getPublishedCatalogTags,
} from "@/database/repositories";
import { catalogFiltersFromRecord } from "@/lib/catalog-query";

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

      {/* Category bubbles */}
      {categories.length > 0 && (
        <div
          className="max-w-7xl mx-auto w-full flex gap-3 overflow-x-auto py-4 px-3 sm:px-6"
          style={{ scrollbarWidth: "none" }}
        >
          <Link
            href="/catalogo"
            className="shrink-0 flex flex-col items-center gap-1 group"
          >
            <div
              className={`size-16 sm:size-18 rounded-full border-2 bg-muted flex items-center justify-center transition-colors ${!activeCategory ? "border-primary" : "border-border group-hover:border-primary"}`}
            >
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Todo
              </span>
            </div>
            <span className="text-[10px] font-medium text-center leading-tight w-16">
              Todo
            </span>
          </Link>
          {categories.map((cat) => {
            const thumb = cat.image_url ?? covers[cat.id];
            const isActive = activeCategory?.id === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/catalogo?categoria=${cat.slug}`}
                className="shrink-0 flex flex-col items-center gap-1 group"
              >
                <div
                  className={`size-16 sm:size-18 rounded-full overflow-hidden border-2 bg-muted transition-colors ${isActive ? "border-primary" : "border-border group-hover:border-primary"}`}
                >
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={cat.name}
                      width={72}
                      height={72}
                      className="w-full h-full object-cover"
                      unoptimized={thumb.startsWith("http")}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                      {cat.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium text-center leading-tight w-16 line-clamp-2 ${isActive ? "text-primary font-semibold" : "text-foreground"}`}
                >
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Sidebar (desktop) + contenido */}
      <div className="max-w-7xl mx-auto w-full flex gap-4 px-3 sm:px-6 lg:gap-6">
        <CatalogSidebar
          categories={categories}
          coverByCategoryId={covers}
          filters={filters}
          tagOptions={tagOptions}
          colorOptions={colorOptions}
        />

        <div className="min-w-0 flex-1">
          {/* Header + filter chips */}
          <div className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                {filters.busqueda
                  ? `"${filters.busqueda}"`
                  : (activeCategory?.name ?? "Todo el catálogo")}
              </h1>
              <p className="tabular-nums text-xs font-medium text-muted-foreground">
                {products.length} {products.length === 1 ? "pieza" : "piezas"}
              </p>
            </div>
            <CatalogFilterChips
              filters={filters}
              categoryName={activeCategory?.name}
            />
          </div>

          {/* Product grid */}
          <section
            id="lista-productos"
            aria-label="Productos"
            className="grid grid-cols-2 gap-2.5 min-[480px]:grid-cols-3 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 pb-16"
          >
            {products.length === 0 ? (
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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        </div>
      </div>
    </article>
  );
}
