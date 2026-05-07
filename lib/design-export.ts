/**
 * Design export: texture (image) and JSON for full control and portability.
 * JSON contains everything needed to recreate or render the design (canvas elements, model, colors).
 */

import type { CanvasElement } from "@/types";

export const DESIGN_EXPORT_VERSION = "1.0";

export interface DesignExportPayload {
  /** Schema version for future migrations */
  version: string;
  /** ISO date when exported */
  exportedAt: string;
  /** Design/project name */
  name: string;
  /** Legacy: ruta de modelo en DB; el cliente ya no carga geometría 3D. */
  modelPath: string | null;
  /** Catalog product id if design was created from a product */
  productId: string | null;
  /** Garment base color (hex) */
  garmentColorHex: string | null;
  /** Base texture URL (Buxxep or user upload) applied under canvas elements */
  baseTextureUrl: string | null;
  /** Canvas elements (text, shapes, images, paths) in logical coords */
  canvasElements: CanvasElement[];
}

/**
 * Builds the export payload from current editor state.
 */
export function buildDesignExportPayload(params: {
  name: string;
  modelPath: string | null;
  productId?: string | null;
  garmentColorHex?: string | null;
  baseTextureUrl?: string | null;
  canvasElements: CanvasElement[];
}): DesignExportPayload {
  return {
    version: DESIGN_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    name: params.name,
    modelPath: params.modelPath ?? null,
    productId: params.productId ?? null,
    garmentColorHex: params.garmentColorHex ?? null,
    baseTextureUrl: params.baseTextureUrl ?? null,
    canvasElements: params.canvasElements,
  };
}

/**
 * Triggers download of the design as a JSON file.
 */
export function downloadDesignJson(
  payload: DesignExportPayload,
  filename?: string,
): void {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ??
    `diseno_${payload.name.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 48)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parses a previously exported design JSON (e.g. for import).
 * Returns null if invalid.
 */
export function parseDesignExportJson(
  json: string,
): DesignExportPayload | null {
  try {
    const data = JSON.parse(json) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;
    if (!Array.isArray(o.canvasElements)) return null;
    return {
      version:
        typeof o.version === "string" ? o.version : DESIGN_EXPORT_VERSION,
      exportedAt:
        typeof o.exportedAt === "string"
          ? o.exportedAt
          : new Date().toISOString(),
      name: typeof o.name === "string" ? o.name : "Importado",
      modelPath: typeof o.modelPath === "string" ? o.modelPath : null,
      productId: typeof o.productId === "string" ? o.productId : null,
      garmentColorHex:
        typeof o.garmentColorHex === "string" ? o.garmentColorHex : null,
      baseTextureUrl:
        typeof o.baseTextureUrl === "string" ? o.baseTextureUrl : null,
      canvasElements: o.canvasElements as CanvasElement[],
    };
  } catch {
    return null;
  }
}
