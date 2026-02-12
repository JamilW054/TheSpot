/**
 * Slugs: belleza, funcionalidad y forma.
 *
 * - Belleza: URLs legibles, kebab-case, sin tildes ni caracteres raros.
 * - Funcionalidad: normalización estable, longitud acotada, id extraíble.
 * - Forma: patrón único [base]-[id] (diseños d01, líneas l01).
 */

/** Longitud máxima de la parte "base" del slug (solo palabras). URLs cortas y claras. */
const SLUG_BASE_MAX_LENGTH = 48;

/** Patrón del sufijo id en slug: d01, d12, l01, l10. */
const SLUG_ID_SUFFIX = /-(d|l)(\d{2})$/i;

/**
 * Convierte un texto en un slug URL-friendly.
 * Minúsculas, sin acentos/ñ, espacios → guiones, sin caracteres especiales.
 */
export function slugify(
  text: string,
  options: { maxLength?: number } = {}
): string {
  const { maxLength = SLUG_BASE_MAX_LENGTH } = options;
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!base) return "";
  if (base.length <= maxLength) return base;
  // Cortar por palabras: último guion antes de maxLength
  const trimmed = base.slice(0, maxLength);
  const lastDash = trimmed.lastIndexOf("-");
  return lastDash > 0 ? trimmed.slice(0, lastDash) : trimmed;
}

/**
 * Construye el slug completo con formato [base]-[id].
 * Diseños: "Pantalón cargo" + d04 → "pantalon-cargo-d04"
 * Líneas: "Colección minimal" + l02 → "coleccion-minimal-l02"
 */
export function buildSlug(name: string, id: string): string {
  const base = slugify(name);
  return base ? `${base}-${id}` : id;
}

/**
 * Extrae el id (d01, l02, etc.) del final del slug.
 * Útil para búsqueda por id cuando el slug pueda variar (redirecciones, historial).
 */
export function parseSlugId(slug: string): string | null {
  const match = slug.match(SLUG_ID_SUFFIX);
  if (!match) return null;
  const prefix = match[1].toLowerCase();
  const num = match[2];
  return `${prefix}${num}`;
}
