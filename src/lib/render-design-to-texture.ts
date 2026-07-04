/**
 * Renders 2D canvas elements (text, images, shapes, path/brush) to a single texture image
 * for previews and export (flat texture, full canvas mapped to the bitmap).
 */

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

/**
 * Renders elements (and optional base texture) to a texture image URL.
 * Returns a data URL or null.
 */
export async function renderElementsToTextureUrl(
  elements: CanvasElement[],
  baseTextureUrl: string | null,
): Promise<string | null> {
  const canvas = document.createElement("canvas");
  canvas.width = DESIGN_TEXTURE_WIDTH;
  canvas.height = DESIGN_TEXTURE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const destX = 0;
  const destY = 0;
  const destW = DESIGN_TEXTURE_WIDTH;
  const destH = DESIGN_TEXTURE_HEIGHT;

  const scaleX = destW / LOGICAL_WIDTH;
  const scaleY = destH / LOGICAL_HEIGHT;

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
      const fontSize = el.fontSize ?? Math.max(12, h * 0.5);
      const fontFamily = el.fontFamily ?? "sans-serif";
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = el.textColor ?? "#111111";
      ctx.globalAlpha = el.opacity ?? 1;
      const text = el.content ?? "Texto";
      const lineHeight = (el.lineHeight ?? 1.2) * fontSize;
      const align = el.textAlign ?? "left";
      ctx.textAlign = align;
      ctx.textBaseline = "top";
      const pad = 4;
      let ty = y + pad;
      const lines = text.split("\n");
      for (const line of lines) {
        const lx =
          align === "center"
            ? x + w / 2
            : align === "right"
              ? x + w - pad
              : x + pad;
        ctx.fillText(line, lx, ty);
        ty += lineHeight;
      }
      ctx.restore();
    } else if (el.type === "shape") {
      ctx.save();
      const kind =
        el.shapeKind ?? (el.content === "circle" ? "circle" : "rect");
      const fill = el.fillColor ?? "#6366f1";
      const stroke = el.shapeStrokeColor ?? "#4f46e5";
      const strokeW = el.shapeStrokeWidth ?? 2;
      ctx.globalAlpha = el.opacity ?? 1;
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeW;
      const radius = el.borderRadius ?? 0;
      if (kind === "circle") {
        const r = Math.min(w, h) / 2;
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (kind === "triangle") {
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (kind === "star") {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const r1 = Math.min(w, h) * 0.2;
        const r2 = Math.min(w, h) * 0.45;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? r2 : r1;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          const px = cx + r * Math.cos(a);
          const py = cy + r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        if (radius > 0) {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, radius);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);
        }
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
