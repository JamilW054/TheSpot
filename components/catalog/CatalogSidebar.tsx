"use client";

import {
  CatalogFiltersPanel,
  type CatalogFiltersPanelProps,
} from "@/components/catalog/CatalogFiltersPanel";

export type CatalogSidebarProps = CatalogFiltersPanelProps;

export function CatalogSidebar(props: CatalogSidebarProps) {
  return (
    <aside
      className="relative hidden shrink-0 overflow-hidden rounded-xl border border-border/90 bg-card/95 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)] backdrop-blur-md lg:block lg:sticky lg:top-24 lg:w-[min(100%,300px)] lg:self-start"
      aria-label="Filtros del catálogo"
    >
      <div
        className="pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-primary/45 to-transparent"
        aria-hidden
      />
      <CatalogFiltersPanel {...props} />
    </aside>
  );
}
