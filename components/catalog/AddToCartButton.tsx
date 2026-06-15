"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Minus, Plus } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  designId?: string | null;
  /** Tallas disponibles del producto. Si hay tallas, se muestra el selector y es obligatorio. */
  sizes?: string[];
  /** Stock disponible por talla. Viene de la DB. Si undefined, no se aplica límite. */
  stockBySize?: Record<string, number>;
  variant?: "default" | "primary";
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({
  productId,
  designId,
  sizes = [],
  stockBySize,
  variant = "default",
  className = "",
  children,
}: AddToCartButtonProps) {
  const { addItem, getQuantity } = useCart();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [justAdded, setJustAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [qty, setQty] = useState(1);

  const hasSizes = sizes.length > 0;
  const sizeError = hasSizes && touched && !selectedSize;
  const quantity = getQuantity(productId, designId, selectedSize);

  // Stock for the currently selected size
  const stockForSelected =
    selectedSize != null && stockBySize != null
      ? (stockBySize[selectedSize] ?? null)
      : null;
  const isOutOfStock = stockForSelected !== null && stockForSelected === 0;
  const maxQty = stockForSelected !== null && stockForSelected > 0 ? stockForSelected : 10;
  const stockIsLow =
    stockForSelected !== null && stockForSelected > 0 && stockForSelected <= 5;

  const handleSizeSelect = (s: string) => {
    if (s === selectedSize) return;
    setSelectedSize(s);
    setQty(1);
    setTouched(true);
  };

  const handleClick = () => {
    if (!isLoading && !user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (hasSizes && !selectedSize) {
      setTouched(true);
      return;
    }
    if (isOutOfStock) return;
    addItem(productId, qty, designId, selectedSize);
    setJustAdded(true);
    setQty(1);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90"
      : "border border-border bg-transparent hover:bg-muted";

  if (!hasSizes) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`${base} ${styles} ${className}`}
      >
        {children ?? (justAdded ? "Añadido" : "Añadir al carrito")}
        {quantity > 0 && !justAdded ? ` (${quantity})` : null}
      </button>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Size selector */}
      <div className="space-y-2">
        <p
          className={`text-sm font-medium ${sizeError ? "text-destructive" : "text-foreground"}`}
        >
          Talla
          {sizeError && (
            <span className="ml-1.5 text-xs font-normal text-destructive">
              — selecciona una talla para continuar
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const sizeStock =
              stockBySize != null ? (stockBySize[s] ?? null) : null;
            const oos = sizeStock !== null && sizeStock === 0;
            const low =
              sizeStock !== null && sizeStock > 0 && sizeStock <= 5;
            return (
              <button
                key={s}
                type="button"
                onClick={() => !oos && handleSizeSelect(s)}
                disabled={oos}
                title={
                  oos
                    ? "Agotado"
                    : low
                      ? `Disponibles ${sizeStock}`
                      : undefined
                }
                className={`relative inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  oos
                    ? "cursor-not-allowed border border-border/40 bg-transparent text-muted-foreground/40 line-through"
                    : selectedSize === s
                      ? "border-2 border-primary bg-primary/10 text-primary"
                      : sizeError
                        ? "border border-destructive/60 bg-destructive/5 text-destructive hover:border-destructive"
                        : "border border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {s}
                {low && !oos && selectedSize !== s && (
                  <span className="absolute -top-1.5 -right-1.5 flex size-3 items-center justify-center rounded-full bg-amber-500 text-[7px] font-bold text-white leading-none">
                    {sizeStock}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity stepper — shown only when a size is selected and in stock */}
      {selectedSize && !isOutOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Cantidad</span>
          <div className="flex items-center overflow-hidden rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Reducir cantidad"
              className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Minus className="size-3" aria-hidden />
            </button>
            <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums text-foreground">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
              aria-label="Aumentar cantidad"
              className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Plus className="size-3" aria-hidden />
            </button>
          </div>
          {stockIsLow && (
            <span className="text-xs font-medium text-amber-500">
              Disponibles {stockForSelected}
            </span>
          )}
        </div>
      )}

      {/* Out-of-stock notice for selected size */}
      {selectedSize && isOutOfStock && (
        <p className="text-sm font-medium text-destructive">
          Talla agotada. Elige otra.
        </p>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={!!isOutOfStock}
        className={`${base} ${styles} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {children ??
          (justAdded
            ? "Añadido"
            : isOutOfStock
              ? "Agotado"
              : "Añadir al carrito")}
        {quantity > 0 && !justAdded && !isOutOfStock ? ` (${quantity})` : null}
      </button>
    </div>
  );
}
