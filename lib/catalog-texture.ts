import type { CatalogProduct } from "@/types";

/**
 * URL de textura para el visor 3D del catálogo.
 * Usa la textura base del producto o la imagen de portada; si es externa, la sirve por proxy para evitar CORS.
 */
/** placehold.co devuelve SVG por defecto; Three.js necesita raster. Forzar .png en la URL. */
function toTextureLoadUrl(url: string): string {
  const u = url.trim();
  if (u.includes("placehold.co") && !u.includes(".png")) {
    return u.replace(/\?/, ".png?");
  }
  return u;
}

export function getCatalogTextureUrl(product: CatalogProduct): string | null {
  const raw = (product.baseTextureUrl ?? product.coverImage ?? "").trim();
  if (!raw) return null;
  const loadUrl = toTextureLoadUrl(raw);
  // URLs externas se cargan por proxy para evitar CORS en Three.js
  if (loadUrl.startsWith("http://") || loadUrl.startsWith("https://")) {
    return `/api/texture?url=${encodeURIComponent(loadUrl)}`;
  }
  return loadUrl;
}
