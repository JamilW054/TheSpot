/**
 * Clave canónica de una variante por sus ejes (talla y/o color).
 *
 * Se usa de forma idéntica en admin, ficha de producto, carrito y stock para que
 * todas las capas coincidan en cómo identifican una combinación. La comparación
 * es case-insensitive (igual que la resolución de variantes en la DB).
 *
 * Ejemplos: ("M", "Rojo") → "m|rojo"; ("M", null) → "m|"; (null, "Rojo") → "|rojo".
 */
export function variantKey(
  size?: string | null,
  color?: string | null,
): string {
  const s = (size ?? "").trim().toLowerCase();
  const c = (color ?? "").trim().toLowerCase();
  return `${s}|${c}`;
}
