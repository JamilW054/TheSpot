"use client";

import { Truck } from "lucide-react";
import {
  qualifiesForFreeShipping,
  remainingForFreeShipping,
} from "@/config/shipping";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { formatDOPFromCents } from "@/lib/format-currency";

/**
 * Cuadro de progreso hacia el envío gratis: cuánto falta para alcanzar el
 * umbral, o el aviso de que el envío ya no se cobra.
 */
export function FreeShippingProgress({
  subtotalCents,
  className = "",
}: {
  subtotalCents: number;
  className?: string;
}) {
  const { freeShippingMinCents: FREE_SHIPPING_MIN_CENTS } = useStoreSettings();
  if (FREE_SHIPPING_MIN_CENTS <= 0) return null;

  const free = qualifiesForFreeShipping(subtotalCents, FREE_SHIPPING_MIN_CENTS);
  const remaining = remainingForFreeShipping(subtotalCents, FREE_SHIPPING_MIN_CENTS);
  const pct = Math.min(
    100,
    Math.round((subtotalCents / FREE_SHIPPING_MIN_CENTS) * 100),
  );

  return (
    <div
      className={`rounded-[14px] border border-primary/25 bg-primary/5 p-4 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <Truck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        {free ? (
          <p className="text-sm font-semibold leading-snug text-primary">
            ¡Tu envío es gratis! 🎉
          </p>
        ) : (
          <p className="text-sm leading-snug text-foreground">
            Te faltan{" "}
            <span className="font-bold text-primary">
              {formatDOPFromCents(remaining)}
            </span>{" "}
            para llegar a {formatDOPFromCents(FREE_SHIPPING_MIN_CENTS)} y tener{" "}
            <span className="font-semibold">envío gratis</span>.
          </p>
        )}
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
