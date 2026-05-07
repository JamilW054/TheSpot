/**
 * Borradores del editor en localStorage.
 * Auto-guardado y listado de proyectos editados (aunque no se haya guardado en la DB).
 */

import type { CanvasElement } from "@/types";

const KEY_CURRENT = "buxxep-editor-current";
const KEY_LIST = "buxxep-editor-drafts";

export interface EditorDraftMeta {
  id: string;
  name: string;
  updatedAt: string;
}

export interface EditorDraftFull {
  id: string;
  name: string;
  updatedAt: string;
  elements: CanvasElement[];
  textureUrl: string | null;
  garmentColorHex?: string;
  productId: string | null;
  designId: string | null;
}

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota or disabled
  }
}

/** Guarda el borrador actual (auto-guardado). También lo añade/actualiza en la lista de proyectos. */
export function saveDraftToLocal(draft: EditorDraftFull): void {
  safeSet(KEY_CURRENT, draft);
  const list: EditorDraftMeta[] = safeParse(KEY_LIST, []);
  const rest = list.filter((d) => d.id !== draft.id);
  safeSet(KEY_LIST, [
    { id: draft.id, name: draft.name, updatedAt: draft.updatedAt },
    ...rest,
  ]);
  safeSet(`buxxep-editor-draft-${draft.id}`, draft);
}

/** Devuelve el borrador actual (último auto-guardado) para restaurar al abrir el editor. */
export function getCurrentDraftFromLocal(): EditorDraftFull | null {
  return safeParse<EditorDraftFull | null>(KEY_CURRENT, null);
}

/** Lista de todos los borradores/proyectos locales (para Mis diseños). */
export function getAllDraftMetaFromLocal(): EditorDraftMeta[] {
  const list = safeParse<EditorDraftMeta[]>(KEY_LIST, []);
  return list.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

/** Carga un borrador por id (para /editor?draft=id). */
export function getDraftFromLocal(id: string): EditorDraftFull | null {
  return safeParse<EditorDraftFull | null>(`buxxep-editor-draft-${id}`, null);
}

/** Elimina un borrador local. */
export function removeDraftFromLocal(id: string): void {
  const list = safeParse<EditorDraftMeta[]>(KEY_LIST, []).filter(
    (d) => d.id !== id,
  );
  safeSet(KEY_LIST, list);
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(`buxxep-editor-draft-${id}`);
    } catch {}
  }
  const current = safeParse<EditorDraftFull | null>(KEY_CURRENT, null);
  if (current?.id === id) {
    safeSet(KEY_CURRENT, null);
  }
}

/** Genera un id estable para el borrador actual (reutiliza el del current si existe). */
export function getOrCreateDraftId(): string {
  const current = getCurrentDraftFromLocal();
  if (current?.id) return current.id;
  return crypto.randomUUID();
}
