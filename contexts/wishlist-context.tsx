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
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextValue>({
  wishlistIds: new Set(),
  toggleWishlist: () => {},
  isInWishlist: () => false,
  wishlistCount: 0,
});

const STORAGE_KEY = "buxxep_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setIds(new Set(JSON.parse(stored) as string[]));
    } catch {}
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => ids.has(productId),
    [ids],
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds: ids,
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
