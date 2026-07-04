"use client";

import { LayoutGrid, Sparkles, Tag, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { catalogMergeHref } from "@/lib/catalog-query";

export function CatalogCatalogSubnav() {
  const sp = useSearchParams();
  const orden = sp.get("orden");
  const precio = sp.get("precio");

  const hasFilters = Boolean(
    sp.get("categoria") || orden || sp.get("etiqueta") || precio,
  );
  const paraTiActive = !hasFilters;
  const novedadesActive = orden === "recientes";
  const ofertasActive = precio === "economico";
  const masVendidoActive = orden === "precio-mayor";

  const tabs = [
    {
      key: "para-ti",
      label: "Para Ti",
      href: "/catalogo",
      icon: LayoutGrid,
      active: paraTiActive,
    },
    {
      key: "novedades",
      label: "Novedades",
      href: catalogMergeHref(sp, { orden: "recientes", precio: null }),
      icon: Sparkles,
      active: novedadesActive,
    },
    {
      key: "ofertas",
      label: "Ofertas",
      href: catalogMergeHref(sp, { precio: "economico", orden: null }),
      icon: Tag,
      active: ofertasActive,
    },
    {
      key: "mas-vendido",
      label: "Más Vendido",
      href: catalogMergeHref(sp, { orden: "precio-mayor", precio: null }),
      icon: TrendingUp,
      active: masVendidoActive,
    },
  ] as const;

  return (
    <nav
      aria-label="Explorar catálogo"
      className="mb-6 flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {tabs.map(({ key, label, href, icon: Icon, active }) => (
        <Link
          key={key}
          href={href}
          scroll={false}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-colors border ${
            active
              ? "bg-foreground text-background border-foreground"
              : "border-border/90 bg-muted/40 text-foreground hover:border-primary/35 hover:bg-muted/70"
          }`}
        >
          <Icon className="size-3.5 opacity-80" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
