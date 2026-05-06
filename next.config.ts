import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
