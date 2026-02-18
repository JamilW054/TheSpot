/**
 * Renders 2D canvas elements (text, images, shapes, path/brush) to a single texture image
 * so it can be applied to the 3D model. The design is drawn in the correct
 * UV region (u0,v0)-(u1,v1) so it appears on the mesh polygons that use those UVs.
 * Polygon logic: each mesh triangle has UV coords; we draw only in the design zone
 * rectangle; the texture is then applied to the model, so all elements map correctly.
 */

import { getDesignZoneUV } from "@/config/texture-uv";
import type { CanvasElement } from "@/types";

export const DESIGN_TEXTURE_WIDTH = 1024;
export const DESIGN_TEXTURE_HEIGHT = 1024;

/** Logical canvas size (same as editor). Element coords are in this space. */
const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 300;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/** Bounds en espacio UV (0–1). Si se pasan, se usan en lugar del config por modelo. */
export type UVBounds = { u0: number; v0: number; u1: number; v1: number };

/**
 * Renders elements (and optional base texture) to a texture image URL.
 * Usa la zona UV para dibujar donde el modelo lo espera (vértice → uv → textura).
 * Si uvBoundsFromModel está definido, son los bounds leídos de geometry.attributes.uv del GLB.
 * Returns a data URL or null.
 */
export async function renderElementsToTextureUrl(
  elements: CanvasElement[],
  baseTextureUrl: string | null,
  modelPath?: string,
  uvBoundsFromModel?: UVBounds | null
): Promise<string | null> {
  const canvas = document.createElement("canvas");
  canvas.width = DESIGN_TEXTURE_WIDTH;
  canvas.height = DESIGN_TEXTURE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const zone =
    uvBoundsFromModel ??
    (modelPath ? getDesignZoneUV(modelPath) : { u0: 0, v0: 0, u1: 1, v1: 1 });

  // Asegurar zona válida (u0 < u1, v0 < v1) para no invertir escala
  const u0 = Math.min(zone.u0, zone.u1);
  const u1 = Math.max(zone.u0, zone.u1);
  const v0 = Math.min(zone.v0, zone.v1);
  const v1 = Math.max(zone.v0, zone.v1);

  // Three.js aplica la textura con flipY: (0,0) en imagen = top-left → GPU v=1 (top).
  // Para que el diseño quede en la zona UV [v0,v1] del modelo, dibujamos en imagen en Y = (1-v1)*H hasta (1-v0)*H.
  let destX = u0 * DESIGN_TEXTURE_WIDTH;
  let destY = (1 - v1) * DESIGN_TEXTURE_HEIGHT;
  let destW = (u1 - u0) * DESIGN_TEXTURE_WIDTH;
  let destH = (v1 - v0) * DESIGN_TEXTURE_HEIGHT;

  // Clamp al tamaño de la textura para no dibujar fuera
  const maxW = DESIGN_TEXTURE_WIDTH - destX;
  const maxH = DESIGN_TEXTURE_HEIGHT - destY;
  destW = Math.max(0, Math.min(destW, maxW, DESIGN_TEXTURE_WIDTH));
  destH = Math.max(0, Math.min(destH, maxH, DESIGN_TEXTURE_HEIGHT));
  destX = Math.max(0, Math.min(destX, DESIGN_TEXTURE_WIDTH - 1));
  destY = Math.max(0, Math.min(destY, DESIGN_TEXTURE_HEIGHT - 1));

  if (destW <= 0 || destH <= 0) {
    return canvas.toDataURL("image/png");
  }

  const scaleX = destW / LOGICAL_WIDTH;
  const scaleY = destH / LOGICAL_HEIGHT;

  // 1) Base: white or uploaded texture (full texture)
  if (baseTextureUrl) {
    try {
      const img = await loadImage(baseTextureUrl);
      ctx.drawImage(img, 0, 0, DESIGN_TEXTURE_WIDTH, DESIGN_TEXTURE_HEIGHT);
    } catch {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, DESIGN_TEXTURE_WIDTH, DESIGN_TEXTURE_HEIGHT);
    }
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, DESIGN_TEXTURE_WIDTH, DESIGN_TEXTURE_HEIGHT);
  }

  // 2) Draw elements only in the design zone (correct UV region)
  ctx.save();
  ctx.translate(destX, destY);
  ctx.scale(scaleX, scaleY);

  for (const el of elements) {
    if (el.visible === false) continue;
    const x = el.x;
    const y = el.y;
    const w = el.width;
    const h = el.height;

    if (el.type === "text") {
      ctx.save();
      const fontSize = Math.max(12, h * 0.5);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = "#111111";
      ctx.fillText(el.content ?? "Texto", x + 4, y + h / 2 + fontSize / 2);
      ctx.restore();
    } else if (el.type === "shape") {
      ctx.save();
      ctx.fillStyle = "rgba(99, 102, 241, 0.35)";
      ctx.strokeStyle = "rgb(99, 102, 241)";
      ctx.lineWidth = 2;
      if (el.content === "circle") {
        const r = Math.min(w, h) / 2;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      }
      ctx.restore();
    } else if (el.type === "image" && el.content) {
      try {
        const img = await loadImage(el.content);
        ctx.drawImage(img, x, y, w, h);
      } catch {
        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(x, y, w, h);
      }
    } else if (el.type === "path" && el.pathData) {
      let points: [number, number][];
      try {
        points = JSON.parse(el.pathData) as [number, number][];
      } catch {
        points = [];
      }
      if (points.length < 2) continue;
      ctx.save();
      const style = el.brushStyle ?? "round";
      const baseWidth = el.strokeWidth ?? 3;
      if (style === "marker") {
        ctx.lineWidth = baseWidth * 1.8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      } else if (style === "square") {
        ctx.lineWidth = baseWidth;
        ctx.lineCap = "butt";
        ctx.lineJoin = "miter";
      } else {
        ctx.lineWidth = baseWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
      if (el.brushTexture) {
        try {
          const texImg = await loadImage(el.brushTexture);
          const pattern = ctx.createPattern(texImg, "repeat");
          if (pattern) ctx.strokeStyle = pattern;
          else ctx.strokeStyle = el.strokeColor ?? "#000000";
        } catch {
          ctx.strokeStyle = el.strokeColor ?? "#000000";
        }
      } else {
        ctx.strokeStyle = el.strokeColor ?? "#000000";
      }
      ctx.beginPath();
      ctx.moveTo(points[0]![0]!, points[0]![1]!);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i]![0]!, points[i]![1]!);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.restore();

  return canvas.toDataURL("image/png");
}
