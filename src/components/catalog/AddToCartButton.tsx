"use client";

import { Check, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { sizeAxisLabel, variantKey } from "@/lib/variants";
import type { ProductColor } from "@/types";

interface AddToCartButtonProps {
  productId: string;
  /** Tallas disponibles. Si hay, se muestra el selector y es obligatorio. */
  sizes?: string[];
  /** Colores disponibles. Si hay, se muestra el selector y es obligatorio. */
  colors?: ProductColor[];
  /** Stock por combinación, clave = variantKey(size, color). */
  stockByKey?: Record<string, number>;
  /** Si false, el producto no rastrea stock (sin límite ni "agotado"). */
  stockTracked?: boolean;
  variant?: "default" | "primary";
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({
  productId,
  sizes = [],
  colors = [],
  stockByKey,
  stockTracked = true,
  variant = "default",
  className = "",
  children,
}: AddToCartButtonProps) {
  const { addItem, getQuantity } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [qty, setQty] = useState(1);

  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;
  const hasVariants = hasSizes || hasColors;

  const sizeMissing = hasSizes && touched && !selectedSize;
  const colorMissing = hasColors && touched && !selectedColor;

  const allSelected =
    (!hasSizes || !!selectedSize) && (!hasColors || !!selectedColor);

  const stockOf = (size: string | null, color: string | null): number | null =>
    stockTracked && stockByKey != null
      ? (stockByKey[variantKey(size, color)] ?? 0)
      : null;

  // Stock disponible sumando el otro eje (para marcar agotada una talla/color).
  const sizeStock = (s: string): number | null => {
    if (stockByKey == null) return null;
    if (!hasColors) return stockOf(s, null);
    return colors.reduce((sum, c) => sum + (stockOf(s, c.label) ?? 0), 0);
  };
  const colorStock = (c: string): number | null => {
    if (stockByKey == null) return null;
    if (!hasSizes) return stockOf(null, c);
    return sizes.reduce((sum, s) => sum + (stockOf(s, c) ?? 0), 0);
  };

  const selectedStock =
    allSelected && stockTracked ? stockOf(selectedSize, selectedColor) : null;
  const isOutOfStock = selectedStock !== null && selectedStock === 0;
  const maxQty =
    selectedStock !== null && selectedStock > 0 ? selectedStock : 10;
  const stockIsLow =
    selectedStock !== null && selectedStock > 0 && selectedStock <= 5;

  const sizeLabel = sizeAxisLabel(sizes);
  const quantity = getQuantity(productId, selectedSize, selectedColor);

  const handleSizeSelect = (s: string) => {
    if (s === selectedSize) return;
    setSelectedSize(s);
    setQty(1);
    setTouched(true);
  };
  const handleColorSelect = (c: string) => {
    if (c === selectedColor) return;
    setSelectedColor(c);
    setQty(1);
    setTouched(true);
  };

  const handleClick = () => {
    if (!allSelected) {
      setTouched(true);
      return;
    }
    if (isOutOfStock) return;
    addItem(productId, qty, selectedSize, selectedColor);
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

  if (!hasVariants) {
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
      {/* Selector de talla */}
      {hasSizes && (
        <div className="space-y-2">
          <p
            className={`text-sm font-medium ${sizeMissing ? "text-destructive" : "text-foreground"}`}
          >
            {sizeLabel.noun}
            {sizeMissing && (
              <span className="ml-1.5 text-xs font-normal text-destructive">
                — {sizeLabel.prompt}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const st = sizeStock(s);
              const oos = st !== null && st === 0;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => !oos && handleSizeSelect(s)}
                  disabled={oos}
                  title={oos ? "Agotado" : undefined}
                  className={`relative inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    oos
                      ? "cursor-not-allowed border border-border/40 bg-transparent text-muted-foreground/40 line-through"
                      : selectedSize === s
                        ? "border-2 border-primary bg-primary/10 text-primary"
                        : sizeMissing
                          ? "border border-destructive/60 bg-destructive/5 text-destructive hover:border-destructive"
                          : "border border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selector de color (swatches) */}
      {hasColors && (
        <div className="space-y-2">
          <p
            className={`text-sm font-medium ${colorMissing ? "text-destructive" : "text-foreground"}`}
          >
            Color
            {selectedColor && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                — {selectedColor}
              </span>
            )}
            {colorMissing && (
              <span className="ml-1.5 text-xs font-normal text-destructive">
                — selecciona un color
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => {
              const st = colorStock(c.label);
              const oos = st !== null && st === 0;
              const active = selectedColor === c.label;
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => !oos && handleColorSelect(c.label)}
                  disabled={oos}
                  aria-label={c.label}
                  aria-pressed={active}
                  title={oos ? `${c.label} — agotado` : c.label}
                  className={`relative inline-flex size-9 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    active
                      ? "border-primary"
                      : colorMissing
                        ? "border-destructive/60"
                        : "border-border hover:border-foreground"
                  } ${oos ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <span
                    className="size-6 rounded-full border border-black/10"
                    style={{ backgroundColor: c.hex ?? "#cccccc" }}
                    aria-hidden
                  />
                  {active && (
                    <Check
                      className="absolute size-4 text-primary drop-shadow"
                      aria-hidden
                    />
                  )}
                  {oos && (
                    <span className="absolute inset-0 m-auto h-px w-7 rotate-45 bg-muted-foreground/60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cantidad — solo cuando todo está seleccionado y en stock */}
      {allSelected && !isOutOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Cantidad</span>
          <div className="flex items-center overflow-hidden rounded-full border border-rose-200">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Reducir cantidad"
              className="flex size-8 items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Minus className="size-3" aria-hidden />
            </button>
            <span className="min-w-8 text-center text-sm font-bold tabular-nums text-foreground">
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
              Disponibles {selectedStock}
            </span>
          )}
        </div>
      )}

      {/* Aviso de combinación agotada */}
      {allSelected && isOutOfStock && (
        <p className="text-sm font-medium text-destructive">
          Combinación agotada. Elige otra.
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
