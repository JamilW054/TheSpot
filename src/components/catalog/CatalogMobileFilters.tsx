"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CatalogFiltersPanel,
  type CatalogFiltersPanelProps,
} from "@/components/catalog/CatalogFiltersPanel";

/** En viewport menor que `lg`: botón flotante con los mismos filtros que el sidebar. */
export function CatalogMobileFilters(props: CatalogFiltersPanelProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();

  // biome-ignore lint/correctness/useExhaustiveDependencies: queryKey encadena cambios de filtros en la URL
  useEffect(() => {
    setOpen(false);
  }, [queryKey]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-5 z-30 flex items-center gap-2 rounded-full border border-primary/40 bg-white/95 px-4 py-3 text-sm font-semibold text-foreground shadow-[0_12px_32px_-14px_rgba(225,29,72,0.55)] backdrop-blur-md transition-colors hover:border-primary hover:bg-rose-50 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-controls="catalog-filters-sheet"
        aria-label="Abrir filtros del catálogo"
      >
        <SlidersHorizontal
          className="size-5 text-primary shrink-0"
          aria-hidden
        />
        Filtros
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
            aria-label="Cerrar filtros"
            onClick={() => setOpen(false)}
          />
          <div
            id="catalog-filters-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Filtros del catálogo"
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col overflow-hidden rounded-t-[1.75rem] border border-rose-100 bg-white shadow-[0_-20px_60px_-20px_rgba(225,29,72,0.25)] lg:hidden"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-rose-100 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                Filtrar catálogo
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-lg border border-border/90 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Cerrar"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
              <CatalogFiltersPanel {...props} />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
