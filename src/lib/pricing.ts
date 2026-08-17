/**
 * Cálculo de rentabilidad por producto — fuente única de verdad.
 *
 * Sin pasarela de pago ni comisiones de terceros: la ganancia es simplemente
 * precio de venta − coste. Todos los montos en céntimos DOP; el redondeo es
 * al céntimo.
 */

export interface ProductProfit {
  priceCents: number;
  costCents: number;
  /** Ganancia bruta = precio − coste. Puede ser negativa. */
  grossProfitCents: number;
  /** Margen sobre el precio de venta, en %. Null si el precio es 0. */
  marginPct: number | null;
}

export function computeProductProfit(
  priceCents: number,
  costCents: number,
): ProductProfit {
  const price = Math.max(0, Math.round(priceCents));
  const cost = Math.max(0, Math.round(costCents));
  const grossProfitCents = price - cost;
  return {
    priceCents: price,
    costCents: cost,
    grossProfitCents,
    marginPct: price > 0 ? (grossProfitCents / price) * 100 : null,
  };
}
