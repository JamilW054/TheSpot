"use client";

import Image from "next/image";
import Link from "next/link";
import type { CategoryRow } from "@/database/repositories";
import {
  CATALOG_CHROME_HIDE_DELTA,
  CATALOG_CHROME_HIDE_OFFSET,
  useHideOnScroll,
} from "@/hooks/use-hide-on-scroll";

export interface CatalogCategoryNavProps {
  categories: CategoryRow[];
  coverByCategoryId: Record<string, string>;
  activeCategoryId?: string;
}

/**
 * Barra de categorías del catálogo: sticky justo debajo del navbar global y
 * con auto-hide al bajar/subir scroll (solo en esta página — el navbar
 * global y el resto del sitio no se ven afectados, ya que este componente
 * solo se renderiza aquí).
 */
export function CatalogCategoryNav({
  categories,
  coverByCategoryId,
  activeCategoryId,
}: CatalogCategoryNavProps) {
  const visible = useHideOnScroll(
    CATALOG_CHROME_HIDE_OFFSET,
    CATALOG_CHROME_HIDE_DELTA,
  );

  if (categories.length === 0) return null;

  return (
    <div
      className={`sticky top-20 z-30 border-b border-rose-100 bg-white/95 backdrop-blur-sm transition-transform duration-300 ease-out sm:top-26 ${
        visible ? "translate-y-0" : "-translate-y-[260px]"
      }`}
    >
      <div className="scrollbar-hide flex w-full gap-4 overflow-x-auto px-3 py-4 sm:px-6 lg:px-8">
        <Link
          href="/catalogo"
          className="group flex shrink-0 flex-col items-center gap-1.5"
        >
          <div
            className={`relative grid size-16 place-items-center rounded-full border-2 bg-rose-50 transition sm:size-18 ${
              !activeCategoryId
                ? "border-primary shadow-[0_0_0_3px_rgba(225,29,72,0.15)]"
                : "border-rose-200 group-hover:border-primary"
            }`}
          >
            <span className="relative inline-flex size-7 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-primary" />
              <span className="absolute inset-[28%] rounded-full bg-white" />
            </span>
          </div>
          <span
            className={`w-16 text-center text-[10px] font-semibold leading-tight ${
              !activeCategoryId ? "text-primary" : "text-foreground"
            }`}
          >
            Todo
          </span>
        </Link>
        {categories.map((cat) => {
          const thumb = cat.image_url ?? coverByCategoryId[cat.id];
          const isActive = activeCategoryId === cat.id;
          const soon = Boolean(cat.coming_soon);
          return (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}`}
              className="group relative flex shrink-0 flex-col items-center gap-1.5"
            >
              <div
                className={`size-16 overflow-hidden rounded-full border-2 bg-rose-50 transition sm:size-18 ${
                  isActive
                    ? "border-primary shadow-[0_0_0_3px_rgba(225,29,72,0.15)]"
                    : "border-rose-200 group-hover:border-primary"
                }`}
              >
                {thumb ? (
                  <Image
                    src={thumb}
                    alt={cat.name}
                    width={72}
                    height={72}
                    className={`size-full object-cover ${soon ? "opacity-60" : ""}`}
                    unoptimized={thumb.startsWith("http")}
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-[10px] font-black uppercase text-primary">
                    {cat.name.slice(0, 2)}
                  </div>
                )}
              </div>
              {soon ? (
                <span className="absolute top-0 right-0 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-white">
                  Soon
                </span>
              ) : null}
              <span
                className={`w-16 line-clamp-2 text-center text-[10px] font-semibold leading-tight ${
                  isActive ? "text-primary" : "text-foreground"
                }`}
              >
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
