"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types";

const STORAGE_KEY = "buxxep-cart";

function cartItemKey(item: CartItem): string {
  return `${item.productId}:${item.designId ?? ""}`;
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
  addItem: (productId: string, quantity?: number, designId?: string | null) => void;
  removeItem: (productId: string, designId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, designId?: string | null) => void;
  clearCart: () => void;
  getQuantity: (productId: string, designId?: string | null) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  const addItem = useCallback((productId: string, quantity = 1, designId?: string | null) => {
    setItems((prev) => {
      const key = `${productId}:${designId ?? ""}`;
      const i = prev.findIndex((it) => cartItemKey(it) === key);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i]!, quantity: next[i]!.quantity + quantity };
        return next;
      }
      return [...prev, { productId, quantity, designId: designId ?? undefined }];
    });
  }, []);

  const removeItem = useCallback((productId: string, designId?: string | null) => {
    const key = `${productId}:${designId ?? ""}`;
    setItems((prev) => prev.filter((it) => cartItemKey(it) !== key));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, designId?: string | null) => {
    if (quantity < 1) {
      removeItem(productId, designId);
      return;
    }
    const key = `${productId}:${designId ?? ""}`;
    setItems((prev) =>
      prev.map((it) => (cartItemKey(it) === key ? { ...it, quantity } : it))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const getQuantity = useCallback(
    (productId: string, designId?: string | null) => {
      const key = `${productId}:${designId ?? ""}`;
      const it = items.find((i) => cartItemKey(i) === key);
      return it?.quantity ?? 0;
    },
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((acc, it) => acc + it.quantity, 0),
    [items]
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
    [items, itemCount, addItem, removeItem, updateQuantity, clearCart, getQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
