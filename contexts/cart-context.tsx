"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addToCartAction,
  clearCartAction,
  getCartLinesAction,
  mergeGuestCartAction,
  removeCartItemAction,
  updateCartQuantityAction,
} from "@/lib/actions/cart";
import { useAuth } from "@/lib/auth-context";
import type { CartItem } from "@/types";

const STORAGE_KEY = "buxxep-cart";

function cartItemKey(item: CartItem): string {
  return `${item.productId}:${item.designId ?? ""}:${item.size ?? ""}`;
}

function keyOf(
  productId: string,
  designId?: string | null,
  size?: string | null,
): string {
  return `${productId}:${designId ?? ""}:${size ?? ""}`;
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
    designId?: string | null,
    size?: string | null,
  ) => void;
  removeItem: (
    productId: string,
    designId?: string | null,
    size?: string | null,
  ) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    designId?: string | null,
    size?: string | null,
  ) => void;
  clearCart: () => void;
  getQuantity: (
    productId: string,
    designId?: string | null,
    size?: string | null,
  ) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  /** Mapa clave-de-línea → id de cart_items (solo con sesión). */
  const lineIdByKey = useRef<Record<string, string>>({});
  const prevUserId = useRef<string | null>(null);
  /**
   * Claves de ítems eliminados mientras lineIdByKey no estaba listo o mientras
   * auth estaba cargando (isLoggedIn = false pero usuario sí tiene sesión).
   * refreshFromDb las omite del estado Y las borra de la DB en cuanto tiene los IDs.
   */
  const pendingRemovals = useRef<Set<string>>(new Set());
  /**
   * Reflejo síncrono de `items` para leer el estado actual dentro de efectos
   * asincrónicos (ej.: transición de login) sin añadirlo como dependencia.
   */
  const itemsRef = useRef<CartItem[]>([]);
  itemsRef.current = items;

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  // Solo persistimos en localStorage cuando se navega como invitado.
  // La guarda `prevUserId.current === null` evita que se sobreescriba el
  // localStorage del invitado con items de DB durante la transición de logout.
  useEffect(() => {
    if (mounted && !isLoggedIn && prevUserId.current === null) saveCart(items);
  }, [items, mounted, isLoggedIn]);

  /** Sincroniza el carrito de invitado entre pestañas. */
  useEffect(() => {
    if (isLoggedIn) return;
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
  }, [isLoggedIn]);

  /**
   * Carga el carrito desde la BD y reconcilia con las eliminaciones del usuario.
   *
   * Regla de oro: una clave en `pendingRemovals` NUNCA se muestra en la UI; sus
   * filas en la BD (incluyendo duplicados) se borran. Las claves cuyas filas ya
   * no existen se consideran confirmadas y se limpian. Así un ítem eliminado no
   * puede "reaparecer" por una carrera, un duplicado o un refresh tardío.
   */
  const refreshFromDb = useCallback(async () => {
    const lines = await getCartLinesAction();
    const map: Record<string, string> = {};
    const next: CartItem[] = [];
    const seenKeys = new Set<string>();
    const purgeIds: string[] = [];
    const purgedKeys = new Set<string>();

    for (const l of lines) {
      const item: CartItem = {
        productId: l.productId,
        quantity: l.quantity,
        designId: l.designId ?? undefined,
        size: l.size ?? undefined,
      };
      const key = cartItemKey(item);
      seenKeys.add(key);

      if (pendingRemovals.current.has(key)) {
        // Eliminación pendiente: borrar esta fila (y cualquier duplicado), nunca mostrar.
        purgeIds.push(l.id);
        purgedKeys.add(key);
        continue;
      }

      // Solo la primera ocurrencia define el id canónico; ignora duplicados en UI.
      if (!(key in map)) {
        map[key] = l.id;
        next.push(item);
      }
    }

    lineIdByKey.current = map;
    setItems(next);

    // Claves pendientes que ya no existen en la BD → eliminación confirmada.
    for (const key of [...pendingRemovals.current]) {
      if (!seenKeys.has(key)) pendingRemovals.current.delete(key);
    }

    // Borrar de la BD las filas pendientes encontradas (incluye duplicados).
    if (purgeIds.length > 0) {
      const results = await Promise.all(
        purgeIds.map((id) => removeCartItemAction(id)),
      );
      // Si todas se borraron OK, limpiar esas claves; si no, se reintenta al próximo refresh.
      if (results.every((r) => r?.ok)) {
        for (const key of purgedKeys) pendingRemovals.current.delete(key);
      }
    }
  }, []);

  // Transición de sesión: fusionar carrito de invitado y cargar el de la BD.
  useEffect(() => {
    if (!mounted) return;
    const uid = user?.id ?? null;
    if (uid === prevUserId.current) return;
    prevUserId.current = uid;

    // Cambió la identidad: descartar eliminaciones pendientes de la sesión previa
    // para no purgar por error ítems legítimos del nuevo usuario.
    pendingRemovals.current.clear();

    if (!uid) {
      // Cerró sesión: volver al carrito local.
      lineIdByKey.current = {};
      setItems(loadCart());
      return;
    }

    void (async () => {
      const guest = loadCart();
      if (guest.length > 0) {
        // Usar el estado en memoria para detectar ítems que el usuario eliminó
        // durante la ventana de carga de auth (isLoggedIn=false pero con sesión).
        const memKeys = new Set(itemsRef.current.map(cartItemKey));

        // Ítems eliminados durante auth-loading → pendingRemovals para que
        // refreshFromDb los excluya del estado Y los borre de la BD.
        for (const it of guest) {
          if (!memKeys.has(cartItemKey(it))) {
            pendingRemovals.current.add(cartItemKey(it));
          }
        }

        // Solo fusionar los ítems que el usuario sigue queriendo.
        const toMerge = guest.filter((it) => memKeys.has(cartItemKey(it)));
        if (toMerge.length > 0) {
          await mergeGuestCartAction(
            toMerge.map((it) => ({
              productId: it.productId,
              size: it.size ?? null,
              designId: it.designId ?? null,
              quantity: it.quantity,
            })),
          );
        }
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
      await refreshFromDb();
    })();
  }, [user, mounted, refreshFromDb]);

  const addItem = useCallback(
    (
      productId: string,
      quantity = 1,
      designId?: string | null,
      size?: string | null,
    ) => {
      const key = keyOf(productId, designId, size);
      // Re-agregar cancela cualquier eliminación pendiente de la misma clave.
      pendingRemovals.current.delete(key);
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
            designId: designId ?? undefined,
            size: size ?? undefined,
          },
        ];
      });
      if (isLoggedIn) {
        void addToCartAction({
          productId,
          size: size ?? null,
          designId: designId ?? null,
          quantity,
        }).then((result) => {
          if (result.ok) void refreshFromDb();
        });
      }
    },
    [isLoggedIn, refreshFromDb],
  );

  const removeItem = useCallback(
    (productId: string, designId?: string | null, size?: string | null) => {
      const key = keyOf(productId, designId, size);
      setItems((prev) => prev.filter((it) => cartItemKey(it) !== key));
      if (isLoggedIn) {
        // El cliente es la autoridad: la clave queda marcada como eliminada hasta
        // que la BD confirme. refreshFromDb nunca la mostrará y purgará sus filas.
        pendingRemovals.current.add(key);
        const id = lineIdByKey.current[key];
        if (id) {
          // Refresco incondicional: aunque la acción falle, refreshFromDb mantiene
          // oculta la clave y reintenta el borrado (idempotente).
          void removeCartItemAction(id).then(() => void refreshFromDb());
        }
        // Si aún no hay id (carrera con el refresh del login), el próximo
        // refreshFromDb purgará la fila por estar en pendingRemovals.
      }
    },
    [isLoggedIn, refreshFromDb],
  );

  const updateQuantity = useCallback(
    (
      productId: string,
      quantity: number,
      designId?: string | null,
      size?: string | null,
    ) => {
      if (quantity < 1) {
        removeItem(productId, designId, size);
        return;
      }
      const key = keyOf(productId, designId, size);
      setItems((prev) =>
        prev.map((it) => (cartItemKey(it) === key ? { ...it, quantity } : it)),
      );
      if (isLoggedIn) {
        const id = lineIdByKey.current[key];
        if (id) {
          void updateCartQuantityAction(id, quantity).then((result) => {
            if (result.ok) void refreshFromDb();
          });
        }
      }
    },
    [isLoggedIn, refreshFromDb, removeItem],
  );

  const clearCart = useCallback(() => {
    if (isLoggedIn) {
      // Marcar todo lo que había como eliminado para que ningún refresh lo resucite.
      for (const it of itemsRef.current) {
        pendingRemovals.current.add(cartItemKey(it));
      }
    }
    setItems([]);
    lineIdByKey.current = {};
    if (isLoggedIn) {
      void clearCartAction().then(() => void refreshFromDb());
    }
  }, [isLoggedIn, refreshFromDb]);

  const getQuantity = useCallback(
    (productId: string, designId?: string | null, size?: string | null) => {
      const key = keyOf(productId, designId, size);
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
