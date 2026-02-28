import type { CatalogProduct } from "@/types";

/**
 * URL de textura para el visor 3D del catálogo.
 * Usa la textura base del producto o la imagen de portada; si es externa, la sirve por proxy para evitar CORS.
 * URLs de Supabase Storage (bucket público) funcionan: el proxy en /api/texture las descarga en el servidor y las sirve al cliente.
 */
/** placehold.co devuelve SVG por defecto; Three.js necesita raster. Forzar .png en la URL. */
function toTextureLoadUrl(url: string): string {
  const u = url.trim();
  if (u.includes("placehold.co") && !u.includes(".png")) {
    return u.replace(/\?/, ".png?");
  }
  return u;
}

/**
 * Para el modelo 3D del catálogo se usa coverImage (portada) cuando existe, así la prenda muestra
 * la misma imagen que la ficha (p. ej. Imgur/Supabase). Si no hay cover, se usa baseTextureUrl.
 */
export function getCatalogTextureUrl(product: CatalogProduct): string | null {
  const base = (product.baseTextureUrl ?? "").trim();
  const cover = (product.coverImage ?? "").trim();
  const coverIsUrl = cover && (cover.startsWith("http://") || cover.startsWith("https://") || cover.startsWith("/"));
  const raw = coverIsUrl ? cover : (base || cover);
  if (!raw) return null;
  const loadUrl = toTextureLoadUrl(raw);
  if (loadUrl.startsWith("http://") || loadUrl.startsWith("https://")) {
    return `/api/texture?url=${encodeURIComponent(loadUrl)}`;
  }
  return loadUrl;
}
