import type { CatalogProduct } from "@/types";

/**
 * URL de textura para canvas / composición (puede pasar por proxy si hace falta CORS).
 * Usa la textura base del producto o la imagen de portada.
 */
/** placehold.co devuelve SVG por defecto; la carga de textura necesita raster. Forzar .png en la URL. */
function toTextureLoadUrl(url: string): string {
  const u = url.trim();
  if (u.includes("placehold.co") && !u.includes(".png")) {
    return u.replace(/\?/, ".png?");
  }
  return u;
}

function r2PublicHostname(): string | null {
  const b =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim()
      : "";
  if (!b) return null;
  try {
    return new URL(b).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Orígenes que el navegador puede cargar en `<img>` / `next/image` sin proxy (evita doble salto al servidor). */
function isDirectCatalogImageHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    const h = hostname.toLowerCase();
    const r2Custom = r2PublicHostname();
    if (r2Custom && h === r2Custom) return true;
    if (h === "localhost" || h === "127.0.0.1") return true;
    if (h.endsWith(".r2.dev")) return true;
    if (h.includes("supabase.co")) return true;
    if (h === "placehold.co" || h.endsWith(".placehold.co")) return true;
    if (h.includes("imgur.com")) return true;
    if (h.includes("unsplash.com")) return true;
    if (h.includes("picsum.photos")) return true;
    return false;
  } catch {
    return false;
  }
}

function resolveCatalogImageRaw(product: CatalogProduct): string | null {
  const base = (product.baseTextureUrl ?? "").trim();
  const cover = (product.coverImage ?? "").trim();
  const coverIsUrl =
    cover &&
    (cover.startsWith("http://") ||
      cover.startsWith("https://") ||
      cover.startsWith("/"));
  const raw = coverIsUrl ? cover : base || cover;
  if (!raw) return null;
  return toTextureLoadUrl(raw);
}

/**
 * URL para mostrar portada/vista en catálogo: directa a CDN cuando es posible (más rápido).
 * Orígenes desconocidos siguen usando `/api/texture` por compatibilidad.
 */
export function getCatalogDisplayImageUrl(
  product: CatalogProduct,
): string | null {
  const loadUrl = resolveCatalogImageRaw(product);
  if (!loadUrl) return null;
  if (loadUrl.startsWith("/")) return loadUrl;
  if (loadUrl.startsWith("http://") || loadUrl.startsWith("https://")) {
    if (isDirectCatalogImageHost(loadUrl)) return loadUrl;
    return `/api/texture?url=${encodeURIComponent(loadUrl)}`;
  }
  return loadUrl;
}

/**
 * Base URL para pipeline canvas (diseño sobre textura): mantiene proxy en https externos
 * para reducir problemas de CORS al pintar en canvas.
 */
export function getCatalogTextureUrl(product: CatalogProduct): string | null {
  const loadUrl = resolveCatalogImageRaw(product);
  if (!loadUrl) return null;
  if (loadUrl.startsWith("http://") || loadUrl.startsWith("https://")) {
    return `/api/texture?url=${encodeURIComponent(loadUrl)}`;
  }
  return loadUrl;
}
