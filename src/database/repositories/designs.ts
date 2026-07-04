import type { CanvasElement, Design } from "@/types";
import { formatDate } from "@/lib/format-date";

/**
 * Esquema nuevo de `designs`: los elementos del canvas viven en `data` (jsonb)
 * y la portada en `thumbnail_url`/`preview_url`. No hay `slug` (se usa el id).
 * El editor está aparcado; esto solo mantiene la lectura sin romper.
 */
export interface DesignRow {
  id: string;
  name: string | null;
  description: string | null;
  user_id: string | null;
  source: string;
  data: unknown;
  preview_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

/** Columnas válidas en el esquema nuevo para leer un diseño. */
export const DESIGN_SELECT =
  "id, name, description, user_id, source, data, preview_url, thumbnail_url, created_at, updated_at";

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana(s)`;
  return formatDate(iso);
}

export function rowToDesign(row: DesignRow): Design {
  const data = row.data as { elements?: unknown } | unknown[] | null;
  const elements = Array.isArray(data)
    ? (data as CanvasElement[])
    : Array.isArray((data as { elements?: unknown })?.elements)
      ? (data as { elements: CanvasElement[] }).elements
      : [];
  return {
    id: row.id,
    slug: row.id,
    name: row.name ?? "Diseño",
    description: row.description ?? "",
    updated: relativeTime(row.updated_at),
    coverImage: row.thumbnail_url ?? row.preview_url ?? "",
    gallery: [],
    canvasElements: elements,
  };
}
