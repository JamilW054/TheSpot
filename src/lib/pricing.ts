/**
 * Cálculo de rentabilidad por producto (admin):
 *   comisión AZUL   = precio × (%AZUL / 100)
 *   comisión G3DEON = precio × (%G3DEON / 100)
 *   beneficio       = precio − coste − comisión AZUL − comisión G3DEON
 *   margen          = beneficio / precio
 * Todos los montos en céntimos DOP; el redondeo es al céntimo.
 */

/** Porcentajes de comisión aplicados a cada venta (editables en /admin/config). */
export interface CommissionRates {
  /** Pasarela AZUL (%). */
  azulPct: number;
  /** Retención G3DEON por venta (%). */
  g3deonPct: number;
}

export const DEFAULT_COMMISSION_RATES: CommissionRates = {
  azulPct: 5,
  g3deonPct: 12,
};

export interface ProductProfit {
  priceCents: number;
  costCents: number;
  azulCommissionCents: number;
  g3deonCommissionCents: number;
  /** Suma de ambas comisiones. */
  commissionCents: number;
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
  const azulCommissionCents = Math.round((price * rates.azulPct) / 100);
  const g3deonCommissionCents = Math.round((price * rates.g3deonPct) / 100);
  const commissionCents = azulCommissionCents + g3deonCommissionCents;
  const netProfitCents = price - cost - commissionCents;
  return {
    priceCents: price,
    costCents: cost,
    azulCommissionCents,
    g3deonCommissionCents,
    commissionCents,
    netProfitCents,
    marginPct: price > 0 ? (netProfitCents / price) * 100 : null,
  };
}
