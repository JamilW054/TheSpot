/**
 * Posts de Instagram @buxxep para la landing.
 * URLs canónicas; los embeds usan {@link LANDING_INSTAGRAM_EMBED_SHORTCODES}.
 */
export const LANDING_INSTAGRAM_POSTS = [
  "https://www.instagram.com/p/DXIzeiKlltz/",
  "https://www.instagram.com/p/DXSsiuIkb0h/",
  "https://www.instagram.com/p/DXfW0Hgkb9c/",
] as const;

/** Shortcode de cada post (iframe embed: /p/{shortcode}/embed/) */
export const LANDING_INSTAGRAM_EMBED_SHORTCODES = [
  "DXIzeiKlltz",
  "DXSsiuIkb0h",
  "DXfW0Hgkb9c",
] as const;
