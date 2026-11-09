import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
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
     * - /landing/** — banners y assets de la landing
     * - /resources/** — logos y assets estáticos
     */
    localPatterns: [
      { pathname: "/landing/**" },
      { pathname: "/resources/**" },
      { pathname: "/perfumes/**" },
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
      // Supabase Storage local (supabase start)
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
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

// Bindings de Cloudflare (IMAGES, ASSETS…) disponibles también en `next dev`.
// No afecta el build ni el despliegue; ver wrangler.jsonc y open-next.config.ts.
if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare")
    .then((m) => m.initOpenNextCloudflareForDev())
    .catch(() => {
      // Sin el paquete instalado, `next dev` sigue funcionando normal.
    });
}
