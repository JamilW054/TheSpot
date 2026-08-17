"use client";

import { ShoppingBag } from "lucide-react";

export function StickyBuyBar({ price }: { price: string }) {
  const scrollToCart = () => {
    document
      .getElementById("add-to-cart-section")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex items-center gap-3 border-t border-rose-100 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Total
        </p>
        <p className="truncate font-mono text-base font-black text-primary tabular-nums">
          {price}
        </p>
      </div>
      <button
        type="button"
        onClick={scrollToCart}
        aria-label="Ir a añadir al carrito"
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-black text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
      >
        <ShoppingBag className="size-4" aria-hidden />
        Comprar ahora
      </button>
    </div>
  );
}
