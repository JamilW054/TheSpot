"use client";

import { useEffect } from "react";
import type { CatalogProduct } from "@/types";

interface CatalogSupabaseDebugLogProps {
  products: CatalogProduct[];
}

/**
 * En desarrollo: escribe en la consola del navegador lo que devolvió Supabase para el catálogo.
 */
export function CatalogSupabaseDebugLog({ products }: CatalogSupabaseDebugLogProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.group("[Catálogo] Datos devueltos por Supabase");
    console.log("Productos:", products);
    console.log("Productos (cantidad):", products.length);
    console.log(
      "Resumen por producto:",
      products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        coverImage: p.coverImage,
        baseTextureUrl: p.baseTextureUrl ?? "(no definido)",
      }))
    );
    console.groupEnd();
  }, [products]);

  return null;
}
