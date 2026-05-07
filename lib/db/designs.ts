import type { CanvasElement } from "@/types";
import type { Design } from "@/types";

export interface DesignRow {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  user_id: string | null;
  source: string;
  model_path: string | null;
  garment_color_hex: string | null;
  canvas_elements: unknown;
  cover_image_url: string | null;
  gallery: unknown;
  created_at: string;
  updated_at: string;
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana(s)`;
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function rowToDesign(row: DesignRow): Design {
  const elements = Array.isArray(row.canvas_elements)
    ? (row.canvas_elements as CanvasElement[])
    : [];
  const gallery = Array.isArray(row.gallery) ? (row.gallery as string[]) : [];
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    name: row.name,
    description: row.description ?? "",
    updated: relativeTime(row.updated_at),
    coverImage: row.cover_image_url ?? "",
    gallery,
    canvasElements: elements,
  };
}
