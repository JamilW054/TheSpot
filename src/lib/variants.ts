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

/**
 * Etiqueta del eje de tamaño según los valores: "ml" → tamaño (perfumes,
 * belleza); el resto → talla (tenis, gorras, relojes).
 */
export function sizeAxisLabel(sizes: string[]): {
  noun: string;
  prompt: string;
} {
  const looksVolume = sizes.some((s) => /\d+\s*ml/i.test(s));
  if (looksVolume) {
    return { noun: "Tamaño", prompt: "selecciona un tamaño" };
  }
  return { noun: "Talla", prompt: "selecciona una talla" };
}
