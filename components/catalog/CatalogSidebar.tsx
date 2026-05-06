"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Layers,
  Search,
  Shirt,
  Sparkles,
  Tags,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { CategoryRow } from "@/lib/db";
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

export interface CatalogSidebarProps {
  categories: CategoryRow[];
  coverByCategoryId: Record<string, string>;
  filters: CatalogQueryParts;
  tagOptions: string[];
}

const PRECIO_BANDS: { value: CatalogPrecio }[] = [
  { value: "economico" },
  { value: "medio" },
  { value: "premium" },
];

export function CatalogSidebar({
  categories,
  coverByCategoryId,
  filters,
  tagOptions,
}: CatalogSidebarProps) {
  const [q, setQ] = useState("");
  const activeSlug = filters.categoria;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.slug.toLowerCase().includes(s),
    );
  }, [categories, q]);

  const rowBase =
    "flex items-center gap-3 rounded-lg border px-2.5 py-2 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const rowInactive =
    "border-transparent bg-muted/35 text-foreground hover:border-border/90 hover:bg-muted/55";
  const rowActive =
    "border-primary/50 bg-primary/[0.12] text-foreground shadow-[inset_0_0_0_1px_rgba(60,200,247,0.18)]";

  const pillBase =
    "inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-center text-[11px] font-semibold leading-tight transition-colors sm:text-xs";
  const pillOff = "border-border/80 bg-muted/30 text-muted-foreground hover:border-primary/35 hover:bg-muted/50 hover:text-foreground";
  const pillOn =
    "border-primary/55 bg-primary/20 text-foreground shadow-[inset_0_0_0_1px_rgba(60,200,247,0.2)]";

  const sectionTitle =
    "flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground";

  return (
    <aside
      className="relative shrink-0 overflow-hidden rounded-xl border border-border/90 bg-card/95 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)] backdrop-blur-md lg:sticky lg:top-24 lg:w-[min(100%,300px)] lg:self-start"
      aria-label="Filtros del catálogo"
    >
      <div
        className="pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-primary/45 to-transparent"
        aria-hidden
      />

      <div className="space-y-5 p-4 sm:p-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar categoría…"
            className="w-full rounded-lg border border-border/90 bg-muted/40 py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/45 focus:outline-none focus:ring-2 focus:ring-ring/35"
            autoComplete="off"
          />
        </div>

        <section aria-labelledby="sidebar-sort">
          <p id="sidebar-sort" className={sectionTitle}>
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
              <ArrowUpWideNarrow className="size-3 shrink-0 opacity-90" aria-hidden />
              Precio ↑
            </Link>
            <Link
              href={catalogQueryHref({ ...filters, orden: "precio-mayor" })}
              scroll={false}
              className={`${pillBase} ${filters.orden === "precio-mayor" ? pillOn : pillOff}`}
            >
              <ArrowDownWideNarrow className="size-3 shrink-0 opacity-90" aria-hidden />
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

        <section aria-labelledby="sidebar-price">
          <p id="sidebar-price" className={sectionTitle}>
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

        {tagOptions.length > 0 ? (
          <>
            <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
            <section aria-labelledby="sidebar-tags">
              <p id="sidebar-tags" className={sectionTitle}>
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

        <section aria-labelledby="sidebar-cats">
          <p id="sidebar-cats" className={sectionTitle}>
            <Layers className="size-3.5 text-primary/80" aria-hidden />
            Categorías
          </p>
          <nav className="mt-2.5 flex max-h-[min(48vh,440px)] flex-col gap-1 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
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

            {filtered.map((cat) => {
              const selected = activeSlug === cat.slug;
              const href = selected
                ? catalogQueryHref(catalogQueryOmit(filters, "categoria"))
                : catalogQueryHref({ ...filters, categoria: cat.slug });
              const cover =
                cat.image_url?.trim() || coverByCategoryId[cat.id];

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

          {filtered.length === 0 ? (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              No hay categorías que coincidan.
            </p>
          ) : null}
        </section>
      </div>
    </aside>
  );
}
