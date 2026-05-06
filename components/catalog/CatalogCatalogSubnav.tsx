"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, Palette, Sparkles } from "lucide-react";
import { catalogMergeHref } from "@/lib/catalog-query";

export function CatalogCatalogSubnav() {
  const sp = useSearchParams();
  const categoria = sp.get("categoria");
  const orden = sp.get("orden");
  const etiqueta = sp.get("etiqueta");
  const precio = sp.get("precio");

  const hasFilters = Boolean(categoria || orden || etiqueta || precio);
  const paraTiActive = !hasFilters;
  const novedadesActive = orden === "recientes";

  const tabs = [
    {
      key: "para-ti",
      label: "Para ti",
      href: "/catalogo",
      icon: LayoutGrid,
      active: paraTiActive,
    },
    {
      key: "novedades",
      label: "Novedades",
      href: catalogMergeHref(sp, { orden: "recientes" }),
      icon: Sparkles,
      active: novedadesActive,
    },
    {
      key: "disena",
      label: "Diseña",
      href: "/editor",
      icon: Palette,
      active: false,
    },
  ] as const;

  return (
    <nav
      aria-label="Explorar catálogo"
      className="mb-8 flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {tabs.map(({ key, label, href, icon: Icon, active }) => (
        <Link
          key={key}
          href={href}
          scroll={key !== "disena"}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors border ${
            active
              ? "bg-primary text-primary-foreground border-primary shadow-[0_8px_24px_-8px_rgba(60,200,247,0.55)]"
              : "border-border/90 bg-muted/40 text-foreground hover:border-primary/35 hover:bg-muted/70"
          }`}
        >
          <Icon className="size-3.5 sm:size-4 opacity-90" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
