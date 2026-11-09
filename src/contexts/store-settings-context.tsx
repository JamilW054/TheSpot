"use client";

import { createContext, useContext, useMemo } from "react";
import { FREE_SHIPPING_MIN_CENTS } from "@/config/shipping";

/** Ajustes públicos de la tienda, editables en /admin sin tocar código. */
export interface PublicStoreSettings {
  /** Umbral de envío gratis en centavos (0 = sin envío gratis). */
  freeShippingMinCents: number;
  /** Slugs de categorías marcadas como "Próximamente". */
  comingSoonSlugs: string[];
}

const DEFAULTS: PublicStoreSettings = {
  freeShippingMinCents: FREE_SHIPPING_MIN_CENTS,
  comingSoonSlugs: [],
};

const StoreSettingsContext = createContext<PublicStoreSettings>(DEFAULTS);

export function StoreSettingsProvider({
  value,
  children,
}: {
  value: PublicStoreSettings;
  children: React.ReactNode;
}) {
  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings(): PublicStoreSettings {
  return useContext(StoreSettingsContext);
}

/** `isSoon(slug)` según las categorías configuradas en el admin. */
export function useComingSoon(): (slug: string | null | undefined) => boolean {
  const { comingSoonSlugs } = useStoreSettings();
  return useMemo(() => {
    const set = new Set(comingSoonSlugs);
    return (slug) => (slug ? set.has(slug) : false);
  }, [comingSoonSlugs]);
}
