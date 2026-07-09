/** Parámetros de URL del catálogo (única fuente para filtros enlazables). */

export type CatalogOrden = "recientes" | "precio-menor" | "precio-mayor" | "az";

export type CatalogPrecio = "economico" | "medio" | "premium";

export interface CatalogQueryParts {
  categoria?: string;
  orden?: CatalogOrden;
  etiqueta?: string;
  precio?: CatalogPrecio;
  color?: string;
  busqueda?: string;
}

const ORDEN_SET = new Set<string>([
  "recientes",
  "precio-menor",
  "precio-mayor",
  "az",
]);

const PRECIO_SET = new Set<string>(["economico", "medio", "premium"]);

export function parseCatalogOrden(
  v: string | undefined,
): CatalogOrden | undefined {
  if (!v || !ORDEN_SET.has(v)) return undefined;
  return v as CatalogOrden;
}

export function parseCatalogPrecio(
  v: string | undefined,
): CatalogPrecio | undefined {
  if (!v || !PRECIO_SET.has(v)) return undefined;
  return v as CatalogPrecio;
}

export function catalogQueryHref(parts: CatalogQueryParts): string {
  const p = new URLSearchParams();
  if (parts.categoria) p.set("categoria", parts.categoria);
  if (parts.orden) p.set("orden", parts.orden);
  if (parts.etiqueta) p.set("etiqueta", parts.etiqueta);
  if (parts.precio) p.set("precio", parts.precio);
  if (parts.color) p.set("color", parts.color);
  if (parts.busqueda) p.set("q", parts.busqueda);
  const q = p.toString();
  return q ? `/catalogo?${q}` : "/catalogo";
}

/** Cliente: fusiona parámetros sobre la query actual (`null` borra la clave). */
export function catalogMergeHref(
  sp: URLSearchParams | { toString(): string },
  patch: Partial<Record<keyof CatalogQueryParts, string | null | undefined>>,
): string {
  const cur = new URLSearchParams(sp.toString());
  (Object.keys(patch) as (keyof CatalogQueryParts)[]).forEach((key) => {
    if (!(key in patch)) return;
    const urlKey = key === "busqueda" ? "q" : key;
    const val = patch[key];
    if (val === null || val === undefined || val === "") cur.delete(urlKey);
    else cur.set(urlKey, val);
  });
  const q = cur.toString();
  return q ? `/catalogo?${q}` : "/catalogo";
}

export function catalogQueryOmit(
  parts: CatalogQueryParts,
  omit: keyof CatalogQueryParts,
): CatalogQueryParts {
  const next: CatalogQueryParts = { ...parts };
  delete next[omit];
  return next;
}

export function catalogFiltersFromRecord(
  r: Record<string, string | string[] | undefined>,
): CatalogQueryParts {
  const first = (k: string): string | undefined => {
    const v = r[k];
    if (Array.isArray(v)) return v[0];
    return v;
  };
  const orden = parseCatalogOrden(first("orden"));
  const precio = parseCatalogPrecio(first("precio"));
  const etiquetaRaw = first("etiqueta")?.trim().toLowerCase();
  const categoriaRaw = first("categoria")?.trim();
  const colorRaw = first("color")?.trim().toLowerCase();
  const busquedaRaw = first("q")?.trim();
  return {
    ...(categoriaRaw ? { categoria: categoriaRaw } : {}),
    ...(orden ? { orden } : {}),
    ...(etiquetaRaw ? { etiqueta: etiquetaRaw } : {}),
    ...(precio ? { precio } : {}),
    ...(colorRaw ? { color: colorRaw } : {}),
    ...(busquedaRaw ? { busqueda: busquedaRaw } : {}),
  };
}

export const CATALOG_PRECIO_LABELS: Record<CatalogPrecio, string> = {
  economico: "Accesible",
  medio: "Medio",
  premium: "Premium",
};

/** Rango legible por banda (RD$), en sincronía con los umbrales de `getProducts`. */
export const CATALOG_PRECIO_RANGE_LABELS: Record<CatalogPrecio, string> = {
  economico: "Menos de RD$2,000",
  medio: "RD$2,000 – RD$6,000",
  premium: "Más de RD$6,000",
};

export const CATALOG_ORDEN_LABELS: Record<CatalogOrden, string> = {
  recientes: "Novedades",
  "precio-menor": "Precio ↑",
  "precio-mayor": "Precio ↓",
  az: "Nombre A-Z",
};
