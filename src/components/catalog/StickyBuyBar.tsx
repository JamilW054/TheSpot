"use client";

import { ShoppingBag } from "lucide-react";

export function StickyBuyBar({ price }: { price: string }) {
  const scrollToCart = () => {
    document
      .getElementById("add-to-cart-section")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 border-t border-border/40 bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <button
        type="button"
        onClick={scrollToCart}
        aria-label="Ir a añadir al carrito"
        className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-muted-foreground transition-colors hover:bg-muted"
      >
        <ShoppingBag className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={scrollToCart}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-black text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
      >
        Comprar ahora
      </button>
    </div>
  );
}
