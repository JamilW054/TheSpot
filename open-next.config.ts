import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Todas las páginas de la tienda son dinámicas (catálogo y pedidos vienen de
// Supabase en cada request), así que no se configura caché incremental (R2).
export default defineCloudflareConfig({});
