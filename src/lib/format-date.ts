/** República Dominicana: UTC-4, sin horario de verano */
const TZ = "America/Santo_Domingo";

export function formatDate(
  iso: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-DO", { timeZone: TZ, ...opts });
  } catch {
    return "";
  }
}

export function formatDateTime(
  iso: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("es-DO", { timeZone: TZ, ...opts });
  } catch {
    return "";
  }
}

export function formatDateShort(iso: string | null | undefined): string {
  return formatDate(iso, { day: "numeric", month: "short" });
}
