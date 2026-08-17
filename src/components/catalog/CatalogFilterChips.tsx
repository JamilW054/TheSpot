import { X } from "lucide-react";
import Link from "next/link";
import type { CatalogQueryParts } from "@/lib/catalog-query";
import {
  CATALOG_ORDEN_LABELS,
  CATALOG_PRECIO_LABELS,
  catalogQueryHref,
  catalogQueryOmit,
} from "@/lib/catalog-query";

function fmtTag(t: string): string {
  return t.length ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

export function CatalogFilterChips({
  filters,
  categoryName,
}: {
  filters: CatalogQueryParts;
  categoryName?: string;
}) {
  const chips: { key: string; label: string; href: string }[] = [];

  if (filters.categoria && categoryName) {
    chips.push({
      key: "cat",
      label: categoryName,
      href: catalogQueryHref(catalogQueryOmit(filters, "categoria")),
    });
  }
  if (filters.orden) {
    chips.push({
      key: "orden",
      label: CATALOG_ORDEN_LABELS[filters.orden],
      href: catalogQueryHref(catalogQueryOmit(filters, "orden")),
    });
  }
  if (filters.etiqueta) {
    chips.push({
      key: "tag",
      label: fmtTag(filters.etiqueta),
      href: catalogQueryHref(catalogQueryOmit(filters, "etiqueta")),
    });
  }
  if (filters.precio) {
    chips.push({
      key: "precio",
      label: CATALOG_PRECIO_LABELS[filters.precio],
      href: catalogQueryHref(catalogQueryOmit(filters, "precio")),
    });
  }
  if (filters.color) {
    chips.push({
      key: "color",
      label: fmtTag(filters.color),
      href: catalogQueryHref(catalogQueryOmit(filters, "color")),
    });
  }

  if (chips.length === 0) return null;

  const chipClass =
    "inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-white";

  return (
    <nav
      className="mb-6 flex flex-wrap items-center gap-2"
      aria-label="Filtros activos"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        Activos
      </span>
      {chips.map((c) => (
        <Link key={c.key} href={c.href} scroll={false} className={chipClass}>
          <span>{c.label}</span>
          <X className="size-3.5 opacity-70" aria-hidden />
          <span className="sr-only">Quitar filtro</span>
        </Link>
      ))}
    </nav>
  );
}
