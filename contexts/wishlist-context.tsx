"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getWishlistEntriesAction,
  mergeGuestWishlistAction,
  toggleWishlistAction,
} from "@/lib/actions/wishlist";
import { useAuth } from "@/lib/auth-context";

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

function saveStorage(dates: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
  } catch {
    /* ignore */
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [dates, setDates] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    setDates(parseStorage());
    setMounted(true);
  }, []);

  // Persistir en localStorage solo como invitado.
  useEffect(() => {
    if (mounted && !isLoggedIn) saveStorage(dates);
  }, [dates, mounted, isLoggedIn]);

  const refreshFromDb = useCallback(async () => {
    const entries = await getWishlistEntriesAction();
    setDates(Object.fromEntries(entries.map((e) => [e.productId, e.addedAt])));
  }, []);

  // Transición de sesión: fusionar lista de invitado y cargar la de la BD.
  useEffect(() => {
    if (!mounted) return;
    const uid = user?.id ?? null;
    if (uid === prevUserId.current) return;
    prevUserId.current = uid;

    if (!uid) {
      setDates(parseStorage());
      return;
    }

    void (async () => {
      const guest = parseStorage();
      const guestIds = Object.keys(guest);
      if (guestIds.length > 0) {
        await mergeGuestWishlistAction(guestIds);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
      await refreshFromDb();
    })();
  }, [user, mounted, refreshFromDb]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setDates((prev) => {
        const next = { ...prev };
        if (next[productId]) delete next[productId];
        else next[productId] = new Date().toISOString();
        return next;
      });
      if (isLoggedIn) {
        void toggleWishlistAction(productId);
      }
    },
    [isLoggedIn],
  );

  const isInWishlist = useCallback(
    (productId: string) => productId in dates,
    [dates],
  );

  const ids = new Set(Object.keys(dates));

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
