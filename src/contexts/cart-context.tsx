"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/types";

const STORAGE_KEY = "jwparfum-cart";

function cartItemKey(item: CartItem): string {
  return `${item.productId}:${item.size ?? ""}:${item.color ?? ""}`;
}

function keyOf(
  productId: string,
  size?: string | null,
  color?: string | null,
): string {
  return `${productId}:${size ?? ""}:${color ?? ""}`;
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  addItem: (
    productId: string,
    quantity?: number,
    size?: string | null,
    color?: string | null,
  ) => void;
  removeItem: (
    productId: string,
    size?: string | null,
    color?: string | null,
  ) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    size?: string | null,
    color?: string | null,
  ) => void;
  clearCart: () => void;
  getQuantity: (
    productId: string,
    size?: string | null,
    color?: string | null,
  ) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  // Persiste en localStorage: no hay cuentas de cliente, el carrito siempre es
  // del invitado (checkout de invitado sin sesión).
  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  /** Sincroniza el carrito entre pestañas. */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue == null) return;
      try {
        const parsed = JSON.parse(e.newValue) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback(
    (
      productId: string,
      quantity = 1,
      size?: string | null,
      color?: string | null,
    ) => {
      const key = keyOf(productId, size, color);
      setItems((prev) => {
        const i = prev.findIndex((it) => cartItemKey(it) === key);
        const current = i >= 0 ? prev[i] : undefined;
        if (current) {
          const next = [...prev];
          next[i] = { ...current, quantity: current.quantity + quantity };
          return next;
        }
        return [
          ...prev,
          {
            productId,
            quantity,
            size: size ?? undefined,
            color: color ?? undefined,
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback(
    (productId: string, size?: string | null, color?: string | null) => {
      const key = keyOf(productId, size, color);
      setItems((prev) => prev.filter((it) => cartItemKey(it) !== key));
    },
    [],
  );

  const updateQuantity = useCallback(
    (
      productId: string,
      quantity: number,
      size?: string | null,
      color?: string | null,
    ) => {
      if (quantity < 1) {
        removeItem(productId, size, color);
        return;
      }
      const key = keyOf(productId, size, color);
      setItems((prev) =>
        prev.map((it) => (cartItemKey(it) === key ? { ...it, quantity } : it)),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getQuantity = useCallback(
    (productId: string, size?: string | null, color?: string | null) => {
      const key = keyOf(productId, size, color);
      const it = items.find((i) => cartItemKey(i) === key);
      return it?.quantity ?? 0;
    },
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((acc, it) => acc + it.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getQuantity,
    }),
    [
      items,
      itemCount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
