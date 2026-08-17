"use client";

import {
  CatalogFiltersPanel,
  type CatalogFiltersPanelProps,
} from "@/components/catalog/CatalogFiltersPanel";
import { useCatalogFiltersVisibility } from "@/contexts/catalog-filters-visibility-context";

export type CatalogSidebarProps = CatalogFiltersPanelProps;

export function CatalogSidebar(props: CatalogSidebarProps) {
  const { visible } = useCatalogFiltersVisibility();

  return (
    <aside
      aria-label="Filtros del catálogo"
      aria-hidden={!visible}
      className={`hidden shrink-0 transition-[width,padding,opacity,border-color] duration-300 ease-in-out lg:sticky lg:top-24 lg:block lg:h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:overflow-x-hidden [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent ${
        visible
          ? "lg:w-65 lg:border-r lg:border-rose-100 lg:pr-5 lg:opacity-100"
          : "lg:w-0 lg:border-r-0 lg:pr-0 lg:opacity-0 lg:pointer-events-none"
      }`}
    >
      <div className="w-65">
        <CatalogFiltersPanel {...props} />
      </div>
    </aside>
  );
}
