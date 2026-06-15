"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useWishlist } from "@/contexts/wishlist-context";

export function WishlistNavLink({ className = "" }: { className?: string }) {
  const { wishlistCount } = useWishlist();

  return (
    <Link
      href="/wishlist"
      className={`relative flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      aria-label={
        wishlistCount > 0
          ? `Favoritos: ${wishlistCount} productos`
          : "Ver favoritos"
      }
    >
      <Heart className="size-[22px]" aria-hidden />
      {wishlistCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
          {wishlistCount > 99 ? "99+" : wishlistCount}
        </span>
      ) : null}
    </Link>
  );
}
