/**
 * Rangos de fechas del reporte de ventas en hora de República Dominicana
 * (America/Santo_Domingo, UTC−4 todo el año, sin horario de verano).
 * Compartido entre la página (cliente) y el repositorio/PDF (servidor).
 */

export const RD_OFFSET = "-04:00";
const RD_OFFSET_MS = 4 * 60 * 60 * 1000;

/** Fecha local RD (YYYY-MM-DD) de un instante. */
export function rdDateKey(d: Date | string): string {
  const t = typeof d === "string" ? new Date(d) : d;
  return new Date(t.getTime() - RD_OFFSET_MS).toISOString().slice(0, 10);
}

export function todayRd(): string {
  return rdDateKey(new Date());
}

function addDays(key: string, n: number): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const SALES_PRESETS = [
  { value: "hoy", label: "Hoy" },
  { value: "ayer", label: "Ayer" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "mes", label: "Este mes" },
  { value: "mes-anterior", label: "Mes anterior" },
  { value: "anio", label: "Este año" },
] as const;

export type SalesPreset = (typeof SALES_PRESETS)[number]["value"];

export function presetRange(preset: string): { from: string; to: string } {
  const today = todayRd();
  const [y, m] = today.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  switch (preset) {
    case "hoy":
      return { from: today, to: today };
    case "ayer": {
      const d = addDays(today, -1);
      return { from: d, to: d };
    }
    case "7d":
      return { from: addDays(today, -6), to: today };
    case "mes":
      return { from: `${y}-${pad(m)}-01`, to: today };
    case "mes-anterior": {
      const py = m === 1 ? y - 1 : y;
      const pm = m === 1 ? 12 : m - 1;
      const last = new Date(Date.UTC(py, pm, 0)).getUTCDate();
      return { from: `${py}-${pad(pm)}-01`, to: `${py}-${pad(pm)}-${pad(last)}` };
    }
    case "anio":
      return { from: `${y}-01-01`, to: today };
    default:
      return { from: addDays(today, -29), to: today };
  }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Normaliza los parámetros de la URL (?desde, ?hasta, ?periodo). */
export function resolveSalesRange(params: {
  desde?: string;
  hasta?: string;
  periodo?: string;
}): { from: string; to: string; preset: string | null } {
  if (params.desde && params.hasta && DATE_RE.test(params.desde) && DATE_RE.test(params.hasta)) {
    const [from, to] =
      params.desde <= params.hasta
        ? [params.desde, params.hasta]
        : [params.hasta, params.desde];
    return { from, to, preset: null };
  }
  const preset = params.periodo ?? "30d";
  return { ...presetRange(preset), preset };
}

/** Límites ISO (UTC) de un rango de fechas locales RD, ambos inclusive. */
export function rangeToIso(from: string, to: string): { startIso: string; endIso: string } {
  return {
    startIso: new Date(`${from}T00:00:00${RD_OFFSET}`).toISOString(),
    endIso: new Date(`${to}T23:59:59.999${RD_OFFSET}`).toISOString(),
  };
}

export function listDays(from: string, to: string): string[] {
  const out: string[] = [];
  let d = from;
  let guard = 0;
  while (d <= to && guard < 800) {
    out.push(d);
    d = addDays(d, 1);
    guard++;
  }
  return out;
}

export function formatRdDay(key: string): string {
  return new Date(`${key}T12:00:00Z`).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Base del reporte: solo cobradas o todas las no canceladas. */
export type SalesBasis = "pagadas" | "todas";

export function parseSalesBasis(v: string | undefined): SalesBasis {
  return v === "todas" ? "todas" : "pagadas";
}
