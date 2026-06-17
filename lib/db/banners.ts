import { createClient } from "@/lib/supabase/server";

/** Banner promocional listo para la UI pública (camelCase). */
export interface PublicBanner {
  id: string;
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  imageUrl: string | null;
  imageUrlMobile: string | null;
  accentColor: string | null;
  linkPath: string | null;
  expiresAt: string | null;
}

interface BannerRowPublic {
  id: string;
  title: string;
  subtitle: string | null;
  eyebrow: string | null;
  image_url: string | null;
  image_url_mobile?: string | null;
  accent_color: string | null;
  link_path: string | null;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  expires_at: string | null;
}

const BASE_COLS =
  "id, title, subtitle, eyebrow, image_url, accent_color, link_path, is_active, sort_order, starts_at, expires_at";

function mapRow(b: BannerRowPublic): PublicBanner {
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    eyebrow: b.eyebrow,
    imageUrl: b.image_url,
    imageUrlMobile: b.image_url_mobile ?? null,
    accentColor: b.accent_color,
    linkPath: b.link_path,
    expiresAt: b.expires_at,
  };
}

/**
 * Banners activos y vigentes para la portada, ordenados por `sort_order`.
 * Respeta `is_active` y la ventana `starts_at`/`expires_at`.
 * Hace fallback sin `image_url_mobile` si la columna aún no existe.
 * Ante cualquier error devuelve `[]` para no romper la home.
 */
export async function getActiveBanners(): Promise<PublicBanner[]> {
  try {
    const supabase = await createClient();
    const nowIso = new Date().toISOString();

    const buildQuery = (cols: string) =>
      supabase
        .from("banners")
        .select(cols)
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
        .or(`expires_at.is.null,expires_at.gte.${nowIso}`)
        .order("sort_order", { ascending: true });

    // Intenta con image_url_mobile primero
    const { data, error } = await buildQuery(`${BASE_COLS}, image_url_mobile`);

    if (error) {
      // 42703 = columna no existe (migración no corrida todavía) → fallback
      const isMissingCol =
        error.code === "42703" || error.message?.includes("image_url_mobile");

      if (!isMissingCol) {
        if (process.env.NODE_ENV === "development") {
          console.error("[banners] getActiveBanners error:", error);
        }
        return [];
      }

      // Fallback sin image_url_mobile
      const { data: fallbackData, error: fallbackError } =
        await buildQuery(BASE_COLS);

      if (fallbackError) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "[banners] getActiveBanners fallback error:",
            fallbackError,
          );
        }
        return [];
      }

      return ((fallbackData ?? []) as unknown as BannerRowPublic[]).map(mapRow);
    }

    return ((data ?? []) as unknown as BannerRowPublic[]).map(mapRow);
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[banners] getActiveBanners exception:", e);
    }
    return [];
  }
}
