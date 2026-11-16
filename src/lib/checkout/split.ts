/**
 * Reparto de un carrito del marketplace entre tiendas (puro: cliente y
 * servidor). Un checkout crea un pedido por tienda; cada parte tiene su propio
 * subtotal, envío, cupón y método de pago.
 */

export interface SplitLine {
  storeId: string;
  lineTotalCents: number;
}

export interface StoreGroup<L extends SplitLine> {
  storeId: string;
  lines: L[];
  subtotalCents: number;
}

/** Agrupa líneas por tienda conservando el orden de aparición. */
export function groupByStore<L extends SplitLine>(lines: L[]): StoreGroup<L>[] {
  const groups = new Map<string, StoreGroup<L>>();
  for (const l of lines) {
    let g = groups.get(l.storeId);
    if (!g) {
      g = { storeId: l.storeId, lines: [], subtotalCents: 0 };
      groups.set(l.storeId, g);
    }
    g.lines.push(l);
    g.subtotalCents += l.lineTotalCents;
  }
  return [...groups.values()];
}

export interface PartTotals {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
}

/** Total de una parte (nunca negativo; el descuento no supera el subtotal). */
export function partTotal(
  subtotalCents: number,
  discountCents: number,
  shippingCents: number,
): PartTotals {
  const discount = Math.max(0, Math.min(discountCents, subtotalCents));
  return {
    subtotalCents,
    discountCents: discount,
    shippingCents: Math.max(0, shippingCents),
    totalCents: Math.max(
      0,
      subtotalCents - discount + Math.max(0, shippingCents),
    ),
  };
}

/** Suma de las partes (lo que ve el cliente en la compra). */
export function sumParts(parts: PartTotals[]): PartTotals {
  return parts.reduce(
    (a, p) => ({
      subtotalCents: a.subtotalCents + p.subtotalCents,
      discountCents: a.discountCents + p.discountCents,
      shippingCents: a.shippingCents + p.shippingCents,
      totalCents: a.totalCents + p.totalCents,
    }),
    { subtotalCents: 0, discountCents: 0, shippingCents: 0, totalCents: 0 },
  );
}
