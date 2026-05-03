import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /** Allow next/image for proxied textures (?url=…); omit `search` to allow any query string */
    localPatterns: [{ pathname: "/api/texture" }],
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
    ],
  },
};

export default nextConfig;
