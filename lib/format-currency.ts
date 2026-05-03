/**
 * Pesos dominicanos (DOP). Los montos en datos siguen en centavos (minor units).
 */

export function formatDOPFromCents(cents: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** Interpreta totales ya formateados (EUR/DOP/RD$, coma o punto decimal) para KPIs. */
export function parseFormattedCurrencyToNumber(formatted: string): number {
  if (!formatted || typeof formatted !== "string") return 0;
  let s = formatted.replace(/\u00a0/g, " ").trim().replace(/\s/g, "");
  s = s.replace(/RD\$/gi, "").replace(/€|\$/g, "").replace(/£/g, "").trim();

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (hasComma && !hasDot) {
    s = s.replace(",", ".");
  }

  const n = Number.parseFloat(s.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
