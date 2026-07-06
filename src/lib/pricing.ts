/**
 * Cálculo de rentabilidad y comisiones — fuente única de verdad.
 *
 * Reglas de negocio:
 * - Comisión AZUL: pasarela de pago, cobra sobre el monto de la transacción
 *   (el procesador no conoce el coste del comerciante).
 *     comisión AZUL = precio de venta × (%AZUL / 100)
 * - Comisión G3DEON: se cobra sobre la GANANCIA del comerciante, nunca sobre
 *   el precio de venta. Si no hay ganancia (precio ≤ coste), la comisión es 0.
 *     ganancia bruta   = precio de venta − coste
 *     comisión G3DEON  = max(0, ganancia bruta) × (%G3DEON / 100)
 * - Ganancia neta = precio de venta − coste − comisión AZUL − comisión G3DEON
 *
 * Todos los montos en céntimos DOP; el redondeo es al céntimo. Ninguna
 * comisión puede ser negativa — se aplica `Math.max(0, …)` en cada cálculo.
 *
 * Cualquier módulo (checkout, pedidos, reportes, dashboards) que necesite
 * calcular la comisión G3DEON debe importar `computeG3deonCommissionCents`
 * o `computeProductProfit` de este archivo en vez de reimplementar la
 * fórmula — así el porcentaje y la regla de negocio quedan en un solo lugar.
 */

/** Porcentajes de comisión aplicados a cada venta (editables en /admin/config). */
export interface CommissionRates {
  /** Pasarela AZUL (%), sobre el precio de venta. */
  azulPct: number;
  /** Retención G3DEON (%), sobre la ganancia bruta (precio − coste). */
  g3deonPct: number;
}

export const DEFAULT_COMMISSION_RATES: CommissionRates = {
  azulPct: 5,
  g3deonPct: 12,
};

/**
 * Comisión de la pasarela AZUL: porcentaje del precio de venta. Nunca negativa.
 */
export function computeAzulCommissionCents(
  sellingPriceCents: number,
  azulPct: number,
): number {
  const price = Math.max(0, Math.round(sellingPriceCents));
  return Math.max(0, Math.round((price * azulPct) / 100));
}

/**
 * Comisión G3DEON: porcentaje de la GANANCIA (precio − coste), no del precio
 * de venta. Si el precio es igual o menor al coste, la ganancia es ≤ 0 y la
 * comisión es 0 — nunca negativa.
 */
export function computeG3deonCommissionCents(
  sellingPriceCents: number,
  costCents: number,
  g3deonPct: number,
): number {
  const price = Math.max(0, Math.round(sellingPriceCents));
  const cost = Math.max(0, Math.round(costCents));
  const grossProfit = Math.max(0, price - cost);
  return Math.max(0, Math.round((grossProfit * g3deonPct) / 100));
}

export interface ProductProfit {
  priceCents: number;
  costCents: number;
  /** Ganancia bruta antes de comisiones (precio − coste). Puede ser negativa. */
  grossProfitCents: number;
  azulCommissionCents: number;
  g3deonCommissionCents: number;
  /** Suma de ambas comisiones. */
  commissionCents: number;
  /** precio − coste − comisión AZUL − comisión G3DEON. */
  netProfitCents: number;
  /** Margen sobre el precio de venta, en %. Null si el precio es 0. */
  marginPct: number | null;
}

export function computeProductProfit(
  priceCents: number,
  costCents: number,
  rates: CommissionRates,
): ProductProfit {
  const price = Math.max(0, Math.round(priceCents));
  const cost = Math.max(0, Math.round(costCents));
  const grossProfitCents = price - cost;
  const azulCommissionCents = computeAzulCommissionCents(price, rates.azulPct);
  const g3deonCommissionCents = computeG3deonCommissionCents(
    price,
    cost,
    rates.g3deonPct,
  );
  const commissionCents = azulCommissionCents + g3deonCommissionCents;
  const netProfitCents = grossProfitCents - commissionCents;
  return {
    priceCents: price,
    costCents: cost,
    grossProfitCents,
    azulCommissionCents,
    g3deonCommissionCents,
    commissionCents,
    netProfitCents,
    marginPct: price > 0 ? (netProfitCents / price) * 100 : null,
  };
}
