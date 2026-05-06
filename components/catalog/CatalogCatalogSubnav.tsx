"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, Palette, Sparkles } from "lucide-react";

function buildHref(parts: {
  categoria?: string | null;
  orden?: string | null;
}) {
  const p = new URLSearchParams();
  if (parts.categoria) p.set("categoria", parts.categoria);
  if (parts.orden === "recientes") p.set("orden", "recientes");
  const q = p.toString();
  return q ? `/catalogo?${q}` : "/catalogo";
}

export function CatalogCatalogSubnav() {
  const sp = useSearchParams();
  const categoria = sp.get("categoria");
  const orden = sp.get("orden");

  const paraTiActive = !orden && !categoria;
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
      href: buildHref({ categoria, orden: "recientes" }),
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
      className="flex gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {tabs.map(({ key, label, href, icon: Icon, active }) => (
        <Link
          key={key}
          href={href}
          scroll={key !== "disena"}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors border ${
            active
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-muted/80 text-foreground border-transparent hover:bg-muted hover:border-border"
          }`}
        >
          <Icon className="size-3.5 sm:size-4 opacity-90" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}
