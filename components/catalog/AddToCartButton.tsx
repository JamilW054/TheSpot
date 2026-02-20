"use client";

import { useCart } from "@/contexts/cart-context";
import { useState } from "react";

interface AddToCartButtonProps {
  productId: string;
  designId?: string | null;
  variant?: "default" | "primary";
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({
  productId,
  designId,
  variant = "default",
  className = "",
  children,
}: AddToCartButtonProps) {
  const { addItem, getQuantity } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const quantity = getQuantity(productId, designId);

  const handleClick = () => {
    addItem(productId, 1, designId);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90"
      : "border border-border bg-transparent hover:bg-muted";

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
