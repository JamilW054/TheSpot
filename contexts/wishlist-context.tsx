"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface WishlistContextValue {
  wishlistIds: Set<string>;
  wishlistDates: Record<string, string>;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextValue>({
  wishlistIds: new Set(),
  wishlistDates: {},
  toggleWishlist: () => {},
  isInWishlist: () => false,
  wishlistCount: 0,
});

const STORAGE_KEY = "buxxep_wishlist";

function parseStorage(): Record<string, string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    // New format: { [id]: isoDate }
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
    // Legacy format: string[]
    if (Array.isArray(parsed)) {
      const now = new Date().toISOString();
      return Object.fromEntries((parsed as string[]).map((id) => [id, now]));
    }
  } catch {}
  return {};
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [dates, setDates] = useState<Record<string, string>>({});

  useEffect(() => {
    setDates(parseStorage());
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setDates((prev) => {
      const next = { ...prev };
      if (next[productId]) {
        delete next[productId];
      } else {
        next[productId] = new Date().toISOString();
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const ids = new Set(Object.keys(dates));

  const isInWishlist = useCallback(
    (productId: string) => productId in dates,
    [dates],
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds: ids,
        wishlistDates: dates,
        toggleWishlist,
        isInWishlist,
        wishlistCount: ids.size,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
