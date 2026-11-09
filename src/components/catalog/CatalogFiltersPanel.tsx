import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronDown,
  Layers,
  LayoutGrid,
  Palette,
  Search,
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
  CATALOG_PRECIO_RANGE_LABELS,
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
    "flex items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const rowInactive = "text-foreground hover:bg-rose-50";
  const rowActive = "bg-rose-50 font-semibold text-primary";

  const pillBase =
    "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-2 text-center text-[11px] font-semibold leading-tight transition-colors sm:text-xs";
  const pillOff =
    "border-rose-200 bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground";
  const pillOn = "border-primary bg-primary text-primary-foreground";

  const sectionSummary =
    "flex w-full cursor-pointer list-none items-center justify-between py-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-foreground outline-none focus-visible:text-primary [&::-webkit-details-marker]:hidden marker:hidden";
  const sectionTitle = "flex items-center gap-2";
  const sectionChevron =
    "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180";

  return (
    <div className="flex flex-col p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 pb-4">
        <p className="text-sm font-bold uppercase tracking-wide text-foreground">
          Filtros
        </p>
        {hasActiveFilters ? (
          <Link
            href="/catalogo"
            scroll={false}
            className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            <X className="size-3.5" aria-hidden />
            Limpiar filtros
          </Link>
        ) : null}
      </div>

      <form action="/catalogo" method="GET" className="relative pb-4">
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
          className="w-full rounded-full border border-rose-200 bg-white py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/35"
          autoComplete="off"
        />
      </form>

      <div className="divide-y divide-border/70 border-t border-border/70">
        <details className="group" open>
          <summary className={sectionSummary}>
            <span className={sectionTitle}>
              <Sparkles className="size-3.5 text-primary/80" aria-hidden />
              Ordenar
            </span>
            <ChevronDown className={sectionChevron} aria-hidden />
          </summary>
          <div className="grid grid-cols-2 gap-1.5 pb-4">
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
        </details>

        <details className="group" open>
          <summary className={sectionSummary}>
            <span className={sectionTitle}>
              <Wallet className="size-3.5 text-primary/80" aria-hidden />
              Precio
            </span>
            <ChevronDown className={sectionChevron} aria-hidden />
          </summary>
          <div className="grid grid-cols-3 gap-1.5 pb-4">
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
                  title={CATALOG_PRECIO_RANGE_LABELS[value]}
                  className={`${pillBase} flex-col gap-0.5 px-1 py-2 ${on ? pillOn : pillOff}`}
                >
                  <span>{CATALOG_PRECIO_LABELS[value]}</span>
                  <span
                    className={`text-[9px] font-normal normal-case ${on ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    {value === "economico"
                      ? "< $2,000"
                      : value === "medio"
                        ? "$2,000–6,000"
                        : "> $6,000"}
                  </span>
                </Link>
              );
            })}
          </div>
        </details>

        {colorOptions.length > 0 ? (
          <details className="group" open>
            <summary className={sectionSummary}>
              <span className={sectionTitle}>
                <Palette className="size-3.5 text-primary/80" aria-hidden />
                Color
              </span>
              <ChevronDown className={sectionChevron} aria-hidden />
            </summary>
            <div className="grid grid-cols-5 gap-2.5 pb-4 sm:grid-cols-6">
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
                          ? "border-primary shadow-[0_0_0_2px_rgba(220,38,38,0.25)]"
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
          </details>
        ) : null}

        {tagOptions.length > 0 ? (
          <details className="group" open>
            <summary className={sectionSummary}>
              <span className={sectionTitle}>
                <Tags className="size-3.5 text-primary/80" aria-hidden />
                Etiquetas
              </span>
              <ChevronDown className={sectionChevron} aria-hidden />
            </summary>
            <div className="flex flex-wrap gap-1.5 pb-4">
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
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-rose-200 bg-white text-muted-foreground hover:border-primary hover:text-foreground"
                    }`}
                  >
                    {fmtTag(tag)}
                  </Link>
                );
              })}
            </div>
          </details>
        ) : null}

        <details className="group" open>
          <summary className={sectionSummary}>
            <span className={sectionTitle}>
              <Layers className="size-3.5 text-primary/80" aria-hidden />
              Categorías
            </span>
            <ChevronDown className={sectionChevron} aria-hidden />
          </summary>
          <nav className="flex flex-col gap-0.5 pb-4">
            <Link
              href={catalogQueryHref(catalogQueryOmit(filters, "categoria"))}
              scroll={false}
              className={`${rowBase} ${!activeSlug ? rowActive : rowInactive}`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-primary">
                <LayoutGrid className="size-4.5 opacity-55" aria-hidden />
              </span>
              <span className="leading-snug">Todo el catálogo</span>
            </Link>

            {categories.map((cat) => {
              const selected = activeSlug === cat.slug;
              const soon = Boolean(cat.coming_soon);
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
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-rose-50">
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="36px"
                        className={`object-cover ${soon ? "opacity-60" : ""}`}
                        unoptimized={thumbNeedsUnoptimized(cover)}
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-muted-foreground">
                        <LayoutGrid
                          className="size-4.5 opacity-45"
                          aria-hidden
                        />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1 leading-snug line-clamp-2">
                    {cat.name}
                  </span>
                  {soon ? (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-primary">
                      Soon
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </details>
      </div>
    </div>
  );
}
