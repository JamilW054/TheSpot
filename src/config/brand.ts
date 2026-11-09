/** Identidad pública de la tienda. Única fuente para nombre, copy y acento. */
export const BRAND_NAME = "The Spot";

export const BRAND_TAGLINE = "Las marcas que quieres, en un solo lugar.";

export const BRAND_DESCRIPTION =
  "The Spot — perfumes, relojes, belleza, gorras y tenis en República Dominicana. Pedido sin cuenta. Pago contra entrega o transferencia.";

export const BRAND_CATEGORIES = [
  "Belleza",
  "Relojes",
  "Perfumes",
  "Gorras",
  "Tenis",
] as const;

/**
 * ¿La categoría está marcada como "Próximamente"? La lista se edita en
 * /admin/categorias (columna `categories.coming_soon`): en servidor se obtiene
 * con `getComingSoonSlugs()` y en cliente con `useComingSoon()`.
 */
export function isComingSoonCategory(
  slug: string | null | undefined,
  comingSoonSlugs: readonly string[],
): boolean {
  if (!slug) return false;
  return comingSoonSlugs.includes(slug);
}

/** Franja horizontal (reemplaza el ticker vertical que se recortaba). */
export const BRAND_TICKER = [
  "Perfumes",
  "Tenis",
  "Belleza · coming soon",
  "Relojes · coming soon",
  "Gorras · coming soon",
  "Envío a todo el país",
  "Pago contra entrega",
  "Transferencia bancaria",
] as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://jwparfum.com";

export const BRAND_SUPPORT_EMAIL = "jamilwilliams054@gmail.com";
export const BRAND_SUPPORT_PHONE = "809-761-2875";
export const BRAND_SUPPORT_PHONE_TEL = "+18097612875";

/** Rojo de marca — CSS usa los mismos valores en globals.css. */
export const BRAND_PRIMARY = "#E11D48";
export const BRAND_PRIMARY_RGB = "225, 29, 72";
