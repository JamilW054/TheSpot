import Image from "next/image";
import Link from "next/link";
import { Shirt } from "lucide-react";
import type { CategoryRow } from "@/lib/db";

function catalogHref(parts: { categoria?: string; orden?: string }) {
  const p = new URLSearchParams();
  if (parts.categoria) p.set("categoria", parts.categoria);
  if (parts.orden === "recientes") p.set("orden", "recientes");
  const q = p.toString();
  return q ? `/catalogo?${q}` : "/catalogo";
}

function thumbNeedsUnoptimized(src: string): boolean {
  return src.includes("placehold.co");
}

export interface CatalogCategoryGridProps {
  categories: CategoryRow[];
  coverByCategoryId: Record<string, string>;
  activeSlug?: string;
  orden?: string;
}

export function CatalogCategoryGrid({
  categories,
  coverByCategoryId,
  activeSlug,
  orden,
}: CatalogCategoryGridProps) {
  if (categories.length === 0) return null;

  const ordenRec = orden === "recientes" ? "recientes" : undefined;

  return (
    <section
      aria-labelledby="catalog-categories-heading"
      className="mb-6 sm:mb-8"
    >
      <div className="flex items-end justify-between gap-3 mb-3 sm:mb-4">
        <h2
          id="catalog-categories-heading"
          className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground"
        >
          Categorías
        </h2>
        <Link
          href={catalogHref({ orden: ordenRec })}
          className="text-xs font-medium text-primary hover:underline underline-offset-4 shrink-0"
        >
          Ver todo
        </Link>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-2 gap-y-4 sm:gap-x-3 sm:gap-y-5">
        {categories.map((cat) => {
          const selected = activeSlug === cat.slug;
          const href = selected
            ? catalogHref({ orden: ordenRec })
            : catalogHref({ categoria: cat.slug, orden: ordenRec });

          const cover = coverByCategoryId[cat.id];

          return (
            <Link
              key={cat.id}
              href={href}
              scroll={false}
              className={`group flex flex-col items-center gap-2 rounded-xl p-1 transition-[color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                selected ? "text-primary" : "text-foreground hover:text-primary"
              }`}
            >
              <div
                className={`relative aspect-square w-full max-w-[68px] sm:max-w-[84px] mx-auto overflow-hidden rounded-[22px] bg-muted border transition-colors ${
                  selected
                    ? "border-primary/40 shadow-[0_0_0_1px_var(--color-primary)]/25"
                    : "border-border/60 group-hover:border-primary/30"
                }`}
              >
                {cover ? (
                  <Image
                    src={cover}
                    alt={`${cat.name} — vista previa`}
                    fill
                    sizes="84px"
                    className="object-cover scale-[0.92] group-hover:scale-[0.96] transition-transform duration-300"
                    unoptimized={thumbNeedsUnoptimized(cover)}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Shirt className="size-7 sm:size-8 opacity-40" aria-hidden />
                  </span>
                )}
              </div>
              <span className="text-center text-[11px] sm:text-xs font-medium leading-snug line-clamp-2 px-0.5">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
