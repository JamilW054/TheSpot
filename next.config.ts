import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que Next infiera la raíz del workspace desde lockfiles externos
  // (hay un bun.lock en el home del usuario).
  turbopack: { root: path.resolve(__dirname) },
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.EXPO_PUBLIC_SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL ??
      "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      "",
  },
  images: {
    /**
     * Next.js 16: local `next/image` src must match a pattern (pathname; omit `search` to allow ?query).
     * - /api/texture — proxied remote textures
     * - /people/** — public/people (landing models)
     * - /project/** — public/project (landing grid cards)
     * - /resources/** — logos y assets estáticos
     */
    localPatterns: [
      { pathname: "/api/texture" },
      { pathname: "/people/**" },
      { pathname: "/project/**" },
      { pathname: "/cloths/**" },
      { pathname: "/landing/**" },
      { pathname: "/resources/**" },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imgur.com",
        pathname: "/**",
      },
      // Supabase Storage: sustituye TU_PROJECT_REF por el ref de tu proyecto si falla
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      /** Cloudflare R2 buckets públicos (dominio r2.dev u otro host en remotePatterns si usas custom domain). */
      {
        protocol: "https",
        hostname: "**.r2.dev",
        pathname: "/**",
      },
      /**
       * Comodín: permite cualquier host https/http para imágenes subidas desde
       * orígenes arbitrarios (p. ej. URLs públicas de la app móvil tras subirlas).
       * NOTA: no cubre `file://` (rutas locales del dispositivo) — esas deben
       * subirse primero o renderizarse con `unoptimized`/`<img>`.
       */
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
