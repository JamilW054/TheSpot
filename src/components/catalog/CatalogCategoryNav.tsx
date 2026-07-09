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
      className={`sticky top-20 z-30 border-b border-border/60 bg-background/95 backdrop-blur-sm transition-transform duration-300 ease-out sm:top-26 ${
        // -100% only clears the bar's own height — it still overlaps the
        // fixed global navbar above it (which sits in the `top-20`/`top-26`
        // gap this bar is offset by). Clear that gap too so it fully leaves
        // the viewport instead of sliding in behind the navbar.
        // Plain pixel value (not calc()) — comfortably clears the bar's own
        // height (~134px) plus its sticky top offset (80-104px) so it fully
        // leaves the viewport instead of stopping level with the navbar.
        visible ? "translate-y-0" : "-translate-y-[260px]"
      }`}
    >
      <div
        className="w-full flex gap-3 overflow-x-auto py-4 px-3 sm:px-6 lg:px-8"
        style={{ scrollbarWidth: "none" }}
      >
        <Link
          href="/catalogo"
          className="shrink-0 flex flex-col items-center gap-1 group"
        >
          <div
            className={`size-16 sm:size-18 rounded-full border-2 bg-muted flex items-center justify-center transition-colors ${!activeCategoryId ? "border-primary" : "border-border group-hover:border-primary"}`}
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
          const thumb = cat.image_url ?? coverByCategoryId[cat.id];
          const isActive = activeCategoryId === cat.id;
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
    </div>
  );
}
