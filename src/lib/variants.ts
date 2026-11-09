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
    return { noun: "Tamaño", prompt: "elige un tamaño si quieres" };
  }
  return { noun: "Talla", prompt: "elige una talla si quieres" };
}

/**
 * Precio unitario real de una línea de carrito: el de la variante elegida si
 * existe; si no eligió tamaño, el de la primera variante del color; si no, el
 * precio mostrado del producto. Debe coincidir con `resolveLines` del checkout.
 */
export function unitPriceForSelection(
  product: { priceCents: number; priceByVariant?: Record<string, number> },
  size?: string | null,
  color?: string | null,
): number {
  const map = product.priceByVariant;
  if (!map || Object.keys(map).length === 0) return product.priceCents;
  const exact = map[variantKey(size, color)];
  if (exact != null) return exact;
  if (!size?.trim()) {
    const wantColor = (color ?? "").trim().toLowerCase();
    const k = Object.keys(map).find((key) => key.split("|")[1] === wantColor);
    if (k) return map[k];
  }
  return product.priceCents;
}
