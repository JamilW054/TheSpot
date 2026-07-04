"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/wishlist-context";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({
  productId,
  className = "",
  size = "md",
}: WishlistButtonProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const saved = isInWishlist(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
      title={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`flex items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        size === "sm" ? "size-7" : "size-9"
      } ${
        saved
          ? "bg-primary/20 text-primary"
          : "bg-background/70 text-muted-foreground hover:bg-background hover:text-primary backdrop-blur-sm"
      } ${className}`}
    >
      <Heart
        className={size === "sm" ? "size-3.5" : "size-4"}
        fill={saved ? "currentColor" : "none"}
        aria-hidden
      />
    </button>
  );
}
