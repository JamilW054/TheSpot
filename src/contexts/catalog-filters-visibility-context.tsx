"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

interface CatalogFiltersVisibilityValue {
  visible: boolean;
  toggle: () => void;
}

const CatalogFiltersVisibilityContext =
  createContext<CatalogFiltersVisibilityValue>({
    visible: true,
    toggle: () => {},
  });

/** Estado (solo desktop) de si el panel de filtros del catálogo está visible o colapsado. */
export function CatalogFiltersVisibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(true);
  return (
    <CatalogFiltersVisibilityContext.Provider
      value={{ visible, toggle: () => setVisible((v) => !v) }}
    >
      {children}
    </CatalogFiltersVisibilityContext.Provider>
  );
}

export function useCatalogFiltersVisibility(): CatalogFiltersVisibilityValue {
  return useContext(CatalogFiltersVisibilityContext);
}
