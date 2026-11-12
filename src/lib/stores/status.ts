import { slugify } from "@/lib/slug";

/** Estados de una tienda del marketplace (puro: cliente y servidor). */
export const STORE_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const;

export type StoreStatus = (typeof STORE_STATUSES)[number];

export const STORE_STATUS_LABEL: Record<StoreStatus, string> = {
  pending: "En revisión",
  approved: "Aprobada",
  rejected: "Rechazada",
  suspended: "Suspendida",
};

export const STORE_STATUS_TONE: Record<StoreStatus, string> = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  approved:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  suspended: "bg-zinc-200 text-zinc-800 dark:bg-zinc-500/20 dark:text-zinc-300",
};

export function isStoreStatus(v: unknown): v is StoreStatus {
  return (
    typeof v === "string" && (STORE_STATUSES as readonly string[]).includes(v)
  );
}

export const MODERATION_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "blocked",
] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export const MODERATION_LABEL: Record<ModerationStatus, string> = {
  pending: "En revisión",
  approved: "Publicado",
  rejected: "Rechazado",
  blocked: "Bloqueado",
};

export const REPORT_REASONS = [
  "sexual",
  "prohibited",
  "counterfeit",
  "misleading",
  "offensive",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  sexual: "Contenido sexual o para adultos",
  prohibited: "Producto prohibido (armas, drogas, etc.)",
  counterfeit: "Falsificación o réplica",
  misleading: "Información engañosa o estafa",
  offensive: "Contenido ofensivo",
  other: "Otro motivo",
};

/** Categorías de negocio que una tienda puede declarar al registrarse. */
export const STORE_BUSINESS_CATEGORIES = [
  "Ropa de mujer",
  "Ropa de hombre",
  "Niños y bebés",
  "Calzado",
  "Bolsos y accesorios",
  "Belleza y cuidado personal",
  "Perfumes",
  "Relojes y joyería",
  "Gorras",
  "Hogar y decoración",
  "Electrónica y celulares",
  "Deportes",
  "Mascotas",
  "Otro",
] as const;

/**
 * Busca palabras prohibidas en un texto (nombre/descripción de producto o
 * tienda). Comparación sin acentos, por palabra o frase completa.
 */
export function findBlockedWords(text: string, blocked: string[]): string[] {
  const norm = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const haystack = ` ${norm(text).replace(/[^a-z0-9:]+/g, " ")} `;
  const hits = new Set<string>();
  for (const raw of blocked) {
    const w = norm(raw).trim();
    if (!w) continue;
    const needle = ` ${w.replace(/[^a-z0-9:]+/g, " ").trim()} `;
    if (haystack.includes(needle)) hits.add(raw.trim());
  }
  return [...hits];
}

/** Slug de tienda a partir de su nombre. */
export function slugifyStoreName(name: string): string {
  return slugify(name);
}
