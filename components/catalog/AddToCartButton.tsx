"use client";

import { useCart } from "@/contexts/cart-context";
import { useState } from "react";

interface AddToCartButtonProps {
  productId: string;
  designId?: string | null;
  /** Tallas disponibles del producto. Si hay tallas, se muestra el selector y es obligatorio. */
  sizes?: string[];
  variant?: "default" | "primary";
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({
  productId,
  designId,
  sizes = [],
  variant = "default",
  className = "",
  children,
}: AddToCartButtonProps) {
  const { addItem, getQuantity } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const hasSizes = sizes.length > 0;
  const sizeError = hasSizes && touched && !selectedSize;
  const quantity = getQuantity(productId, designId, selectedSize);

  const handleClick = () => {
    if (hasSizes && !selectedSize) {
      setTouched(true);
      return;
    }
    addItem(productId, 1, designId, selectedSize);
    setJustAdded(true);
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
      <div className="space-y-2">
        <p className={`text-sm font-medium ${sizeError ? "text-destructive" : "text-foreground"}`}>
          Talla
          {sizeError && (
            <span className="ml-1.5 text-xs font-normal text-destructive">
              — selecciona una talla para continuar
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSelectedSize(s);
                setTouched(true);
              }}
              className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selectedSize === s
                  ? "border-2 border-primary bg-primary/10 text-primary"
                  : sizeError
                    ? "border border-destructive/60 bg-destructive/5 text-destructive hover:border-destructive"
                    : "border border-border bg-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className={`${base} ${styles} ${className}`}
      >
        {children ?? (justAdded ? "Añadido" : "Añadir al carrito")}
        {quantity > 0 && !justAdded ? ` (${quantity})` : null}
      </button>
    </div>
  );
}
