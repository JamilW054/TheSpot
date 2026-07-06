import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Layers,
  Palette,
  Search,
  Shirt,
  Sparkles,
  Tags,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CategoryRow } from "@/database/repositories";
import type { CatalogPrecio, CatalogQueryParts } from "@/lib/catalog-query";
import {
  CATALOG_PRECIO_LABELS,
  catalogQueryHref,
  catalogQueryOmit,
} from "@/lib/catalog-query";

function thumbNeedsUnoptimized(src: string): boolean {
  return src.includes("placehold.co");
}

function fmtTag(t: string): string {
  return t.length ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

export interface CatalogFiltersPanelProps {
  categories: CategoryRow[];
  coverByCategoryId: Record<string, string>;
  filters: CatalogQueryParts;
  tagOptions: string[];
  colorOptions: { label: string; hex: string | null }[];
}

const PRECIO_BANDS: { value: CatalogPrecio }[] = [
  { value: "economico" },
  { value: "medio" },
  { value: "premium" },
];

/** Contenido de filtros (orden, precio, etiquetas, categorías). Usado en sidebar desktop y panel móvil. */
export function CatalogFiltersPanel({
  categories,
  coverByCategoryId,
  filters,
  tagOptions,
  colorOptions,
}: CatalogFiltersPanelProps) {
  const activeSlug = filters.categoria;
  const hasActiveFilters = Boolean(
    filters.categoria ||
      filters.orden ||
      filters.etiqueta ||
      filters.precio ||
      filters.color ||
      filters.busqueda,
  );

  const rowBase =
    "flex items-center gap-3 rounded-lg border px-2.5 py-2 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const rowInactive =
    "border-transparent bg-muted/35 text-foreground hover:border-border/90 hover:bg-muted/55";
  const rowActive =
    "border-primary/50 bg-primary/[0.12] text-foreground shadow-[inset_0_0_0_1px_rgba(60,200,247,0.18)]";

  const pillBase =
    "inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-center text-[11px] font-semibold leading-tight transition-colors sm:text-xs";
  const pillOff =
    "border-border/80 bg-muted/30 text-muted-foreground hover:border-primary/35 hover:bg-muted/50 hover:text-foreground";
  const pillOn =
    "border-primary/55 bg-primary/20 text-foreground shadow-[inset_0_0_0_1px_rgba(60,200,247,0.2)]";

  const sectionTitle =
    "flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground";

  return (
    <div className="space-y-5 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold uppercase tracking-wide text-foreground">
          Filtros
        </p>
        {hasActiveFilters ? (
          <Link
            href="/catalogo"
            scroll={false}
            className="inline-flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <X className="size-3.5" aria-hidden />
            Limpiar filtros
          </Link>
        ) : null}
      </div>

      <form action="/catalogo" method="GET" className="relative">
        {filters.categoria ? (
          <input type="hidden" name="categoria" value={filters.categoria} />
        ) : null}
        {filters.orden ? (
          <input type="hidden" name="orden" value={filters.orden} />
        ) : null}
        {filters.etiqueta ? (
          <input type="hidden" name="etiqueta" value={filters.etiqueta} />
        ) : null}
        {filters.precio ? (
          <input type="hidden" name="precio" value={filters.precio} />
        ) : null}
        {filters.color ? (
          <input type="hidden" name="color" value={filters.color} />
        ) : null}
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          defaultValue={filters.busqueda ?? ""}
          placeholder="Buscar"
          className="w-full rounded-lg border border-border/90 bg-muted/40 py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/45 focus:outline-none focus:ring-2 focus:ring-ring/35"
          autoComplete="off"
        />
      </form>

      <section aria-labelledby="panel-sort">
        <p id="panel-sort" className={sectionTitle}>
          <Sparkles className="size-3.5 text-primary/80" aria-hidden />
          Ordenar
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5">
          <Link
            href={catalogQueryHref(catalogQueryOmit(filters, "orden"))}
            scroll={false}
            className={`${pillBase} col-span-2 ${!filters.orden ? pillOn : pillOff}`}
          >
            Catálogo
          </Link>
          <Link
            href={catalogQueryHref({ ...filters, orden: "precio-menor" })}
            scroll={false}
            className={`${pillBase} ${filters.orden === "precio-menor" ? pillOn : pillOff}`}
          >
            <ArrowUpWideNarrow
              className="size-3 shrink-0 opacity-90"
              aria-hidden
            />
            Precio ↑
          </Link>
          <Link
            href={catalogQueryHref({ ...filters, orden: "precio-mayor" })}
            scroll={false}
            className={`${pillBase} ${filters.orden === "precio-mayor" ? pillOn : pillOff}`}
          >
            <ArrowDownWideNarrow
              className="size-3 shrink-0 opacity-90"
              aria-hidden
            />
            Precio ↓
          </Link>
          <Link
            href={catalogQueryHref({ ...filters, orden: "az" })}
            scroll={false}
            className={`${pillBase} col-span-2 ${filters.orden === "az" ? pillOn : pillOff}`}
          >
            Nombre A-Z
          </Link>
        </div>
      </section>

      <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <section aria-labelledby="panel-price">
        <p id="panel-price" className={sectionTitle}>
          <Wallet className="size-3.5 text-primary/80" aria-hidden />
          Precio
        </p>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {PRECIO_BANDS.map(({ value }) => {
            const on = filters.precio === value;
            const href = on
              ? catalogQueryHref(catalogQueryOmit(filters, "precio"))
              : catalogQueryHref({ ...filters, precio: value });
            return (
              <Link
                key={value}
                href={href}
                scroll={false}
                className={`${pillBase} flex-col gap-0.5 px-1 py-2 ${on ? pillOn : pillOff}`}
              >
                <span>{CATALOG_PRECIO_LABELS[value]}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {colorOptions.length > 0 ? (
        <>
          <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
          <section aria-labelledby="panel-color">
            <p id="panel-color" className={sectionTitle}>
              <Palette className="size-3.5 text-primary/80" aria-hidden />
              Color
            </p>
            <div className="mt-2.5 grid grid-cols-5 gap-2.5 sm:grid-cols-6">
              {colorOptions.map((c) => {
                const key = c.label.toLowerCase();
                const on = filters.color === key;
                const href = on
                  ? catalogQueryHref(catalogQueryOmit(filters, "color"))
                  : catalogQueryHref({ ...filters, color: key });
                return (
                  <Link
                    key={c.label}
                    href={href}
                    scroll={false}
                    title={c.label}
                    className="flex flex-col items-center gap-1"
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-all ${
                        on
                          ? "border-primary shadow-[0_0_0_2px_rgba(60,200,247,0.25)]"
                          : "border-border/70 hover:border-primary/45"
                      }`}
                      style={c.hex ? { backgroundColor: c.hex } : undefined}
                    >
                      {!c.hex ? (
                        <span className="size-full bg-linear-to-br from-rose-400 via-amber-300 to-sky-400" />
                      ) : null}
                    </span>
                    <span className="max-w-13 truncate text-center text-[10px] font-medium leading-tight text-muted-foreground">
                      {fmtTag(c.label)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      ) : null}

      {tagOptions.length > 0 ? (
        <>
          <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
          <section aria-labelledby="panel-tags">
            <p id="panel-tags" className={sectionTitle}>
              <Tags className="size-3.5 text-primary/80" aria-hidden />
              Etiquetas
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {tagOptions.map((tag) => {
                const on = filters.etiqueta === tag;
                const href = on
                  ? catalogQueryHref(catalogQueryOmit(filters, "etiqueta"))
                  : catalogQueryHref({ ...filters, etiqueta: tag });
                return (
                  <Link
                    key={tag}
                    href={href}
                    scroll={false}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      on
                        ? "border-primary/55 bg-primary/15 text-foreground"
                        : "border-border/70 bg-muted/25 text-muted-foreground hover:border-primary/35 hover:text-foreground"
                    }`}
                  >
                    {fmtTag(tag)}
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      ) : null}

      <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />

      <section aria-labelledby="panel-cats">
        <p id="panel-cats" className={sectionTitle}>
          <Layers className="size-3.5 text-primary/80" aria-hidden />
          Categorías
        </p>
        <nav className="mt-2.5 flex max-h-[min(48vh,440px)] flex-col gap-1 overflow-y-auto pr-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/45 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted/50">
          <Link
            href={catalogQueryHref(catalogQueryOmit(filters, "categoria"))}
            scroll={false}
            className={`${rowBase} ${!activeSlug ? rowActive : rowInactive}`}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground ring-1 ring-border/50">
              <Shirt className="size-5 opacity-55" aria-hidden />
            </span>
            <span className="font-medium leading-snug">Todo el catálogo</span>
          </Link>

          {categories.map((cat) => {
            const selected = activeSlug === cat.slug;
            const href = selected
              ? catalogQueryHref(catalogQueryOmit(filters, "categoria"))
              : catalogQueryHref({ ...filters, categoria: cat.slug });
            const cover = cat.image_url?.trim() || coverByCategoryId[cat.id];

            return (
              <Link
                key={cat.id}
                href={href}
                scroll={false}
                className={`${rowBase} ${selected ? rowActive : rowInactive}`}
              >
                <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized={thumbNeedsUnoptimized(cover)}
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-muted-foreground">
                      <Shirt className="size-5 opacity-45" aria-hidden />
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1 font-medium leading-snug line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </section>
    </div>
  );
}
