"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCatalogFiltersVisibility } from "@/contexts/catalog-filters-visibility-context";

/**
 * Manija flotante para colapsar/expandir el sidebar de filtros: fixed al
 * viewport y centrada verticalmente, así queda siempre alcanzable sin
 * importar cuánto se haya bajado en la grilla de productos (a diferencia de
 * un botón dentro del encabezado, que se pierde scroll abajo). Sigue el
 * borde del sidebar — se desliza junto con su animación de colapso.
 * Solo escritorio: en móvil el drawer de `CatalogMobileFilters` ya cubre esto.
 */
export function CatalogFiltersToggleButton() {
  const { visible, toggle } = useCatalogFiltersVisibility();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={visible}
      aria-label={visible ? "Ocultar filtros" : "Mostrar filtros"}
      title={visible ? "Ocultar filtros" : "Mostrar filtros"}
      className={`fixed top-1/2 z-40 hidden -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-border/80 bg-card py-5 px-1.5 text-muted-foreground shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] transition-[left,background-color,color] duration-300 ease-in-out hover:bg-muted/60 hover:text-primary lg:flex ${
        visible ? "left-73" : "left-8"
      }`}
    >
      {visible ? (
        <ChevronLeft className="size-4" aria-hidden />
      ) : (
        <ChevronRight className="size-4" aria-hidden />
      )}
    </button>
  );
}
