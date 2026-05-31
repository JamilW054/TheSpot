import type { CanvasElement, Design } from "@/types";

export interface DesignRow {
  id: string;
  name: string;
  description: string | null;
  user_id: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana(s)`;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export function rowToDesign(row: DesignRow): Design {
  return {
    id: row.id,
    slug: row.id,
    name: row.name,
    description: row.description ?? "",
    updated: relativeTime(row.updated_at),
    coverImage: "",
    gallery: [],
  };
}
