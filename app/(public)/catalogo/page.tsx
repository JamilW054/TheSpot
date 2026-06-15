import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { CatalogFilterChips } from "@/components/catalog/CatalogFilterChips";
import { CatalogMobileFilters } from "@/components/catalog/CatalogMobileFilters";
import { CatalogProductViewerWithDesign } from "@/components/catalog/CatalogProductViewerWithDesign";
import { CatalogSupabaseDebugLog } from "@/components/catalog/CatalogSupabaseDebugLog";
import {
  CATALOG_PRECIO_LABELS,
  type CatalogPrecio,
  type CatalogQueryParts,
  catalogFiltersFromRecord,
  catalogQueryHref,
  catalogQueryOmit,
} from "@/lib/catalog-query";
import {
  getCategoriesPublic,
  getCategoryCoverByCategoryId,
  getProducts,
  getPublishedCatalogTags,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo | Buxxep",
  description: "Ropa a la venta. Añade al carrito o consulta cada producto.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const SORT_TABS = [
  { label: "Para Ti", orden: undefined, precio: undefined },
  { label: "Novedades", orden: "recientes", precio: undefined },
  { label: "Precio ↑", orden: "precio-menor", precio: undefined },
  { label: "Precio ↓", orden: "precio-mayor", precio: undefined },
  { label: "Ofertas", orden: undefined, precio: "economico" },
  { label: "A-Z", orden: "az", precio: undefined },
] as const;

function sortTabHref(
  filters: CatalogQueryParts,
  orden?: string,
  precio?: string,
) {
  const sp = new URLSearchParams();
  if (filters.categoria) sp.set("categoria", filters.categoria);
  if (filters.busqueda) sp.set("q", filters.busqueda);
  if (orden) sp.set("orden", orden);
  if (precio) sp.set("precio", precio);
  const q = sp.toString();
  return q ? `/catalogo?${q}` : "/catalogo";
}

function isSortTabActive(
  filters: CatalogQueryParts,
  orden?: string,
  precio?: string,
) {
  if (!orden && !precio) return !filters.orden && !filters.precio;
  if (orden) return filters.orden === orden;
  return filters.precio === precio;
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
      busqueda: filters.busqueda,
    }),
    getCategoriesPublic(),
    getCategoryCoverByCategoryId(),
    getPublishedCatalogTags(),
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

      {/* ── Sticky top bar: search + filters button ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center gap-2">
          <form action="/catalogo" method="GET" className="flex-1 min-w-0">
            {filters.categoria && (
              <input type="hidden" name="categoria" value={filters.categoria} />
            )}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                aria-hidden
              />
              <input
                type="text"
                name="q"
                defaultValue={filters.busqueda ?? ""}
                placeholder="Busca en el catálogo…"
                autoComplete="off"
                className="w-full rounded-full border border-border bg-muted/40 pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
              />
            </div>
          </form>
          <Suspense fallback={null}>
            <CatalogMobileFilters
              categories={categories}
              coverByCategoryId={covers}
              filters={filters}
              tagOptions={tagOptions}
            />
          </Suspense>
        </div>

        {/* Sort chips */}
        <div
          className="max-w-7xl mx-auto px-3 sm:px-6 pb-1.5 flex gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {SORT_TABS.map((tab) => {
            const active = isSortTabActive(filters, tab.orden, tab.precio);
            return (
              <Link
                key={tab.label}
                href={sortTabHref(filters, tab.orden, tab.precio)}
                scroll={false}
                className={`shrink-0 px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "border-border/80 bg-muted/40 text-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Price + tag filter chips */}
        <div
          className="max-w-7xl mx-auto px-3 sm:px-6 pb-2 flex items-center gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Precio
          </span>
          {(["economico", "medio", "premium"] as CatalogPrecio[]).map((val) => {
            const active = filters.precio === val;
            const href = active
              ? catalogQueryHref(catalogQueryOmit(filters, "precio"))
              : catalogQueryHref({ ...filters, precio: val });
            return (
              <Link
                key={val}
                href={href}
                scroll={false}
                className={`shrink-0 px-3 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                  active
                    ? "bg-primary text-background border-primary"
                    : "border-border/80 bg-muted/40 text-foreground hover:bg-muted"
                }`}
              >
                {CATALOG_PRECIO_LABELS[val]}
              </Link>
            );
          })}
          {tagOptions.length > 0 && (
            <>
              <span
                className="shrink-0 w-px h-4 bg-border/60 mx-1"
                aria-hidden
              />
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Tags
              </span>
              {tagOptions.map((tag) => {
                const active = filters.etiqueta === tag;
                const href = active
                  ? catalogQueryHref(catalogQueryOmit(filters, "etiqueta"))
                  : catalogQueryHref({ ...filters, etiqueta: tag });
                const label = tag.charAt(0).toUpperCase() + tag.slice(1);
                return (
                  <Link
                    key={tag}
                    href={href}
                    scroll={false}
                    className={`shrink-0 px-3 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                      active
                        ? "bg-primary text-background border-primary"
                        : "border-border/80 bg-muted/40 text-foreground hover:bg-muted"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </div>

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

      {/* Header + filter chips */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 pb-3">
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
        className="max-w-7xl mx-auto w-full grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 px-3 sm:px-4 pb-16"
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
          <article
            key={product.id}
            className="group/card flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-[0_8px_32px_-12px_rgba(60,200,247,0.22)]"
          >
            <Link
              href={`/catalogo/${product.slug}`}
              className="relative flex aspect-3/4 overflow-hidden bg-muted"
            >
              <div className="relative h-full w-full">
                <CatalogProductViewerWithDesign
                  product={product}
                  design={null}
                  compact
                />
              </div>
            </Link>
            <div className="flex flex-col gap-1.5 border-t border-border/60 p-2.5 sm:p-3">
              <h2 className="text-xs font-semibold leading-tight text-card-foreground line-clamp-1 sm:text-sm">
                <Link
                  href={`/catalogo/${product.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {product.name}
                </Link>
              </h2>
              <div className="flex items-center justify-between gap-2">
                <span className="tabular-nums text-sm font-bold text-primary">
                  {product.price}
                </span>
                <AddToCartButton
                  productId={product.id}
                  variant="primary"
                  className="inline-flex shrink-0 rounded-lg text-[10px] px-2 py-1 sm:text-xs sm:px-3 sm:py-1.5"
                />
              </div>
              <div className="flex gap-1.5 pt-0.5">
                <Link
                  href={`/catalogo/${product.slug}`}
                  className="flex-1 inline-flex items-center justify-center rounded-md border border-border/80 bg-transparent px-2 py-1.5 text-[10px] font-medium text-foreground transition-colors hover:bg-muted/60 sm:text-xs"
                >
                  Ver
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </article>
  );
}
