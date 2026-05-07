"use client";

import { useEffect } from "react";
import type { CatalogProduct } from "@/types";

interface CatalogSupabaseDebugLogProps {
  products: CatalogProduct[];
  /** Cuántas filas devolvió `getCategoriesPublic` (0 suele indicar error silenciado o tabla vacía). */
  categoriesCount?: number;
}

/**
 * En desarrollo: escribe en la consola del navegador lo que devolvió Supabase para el catálogo.
 */
export function CatalogSupabaseDebugLog({
  products,
  categoriesCount,
}: CatalogSupabaseDebugLogProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.group("[Catálogo] Datos devueltos por Supabase");
    console.log("Categorías (cantidad):", categoriesCount ?? "(no indicado)");
    if ((categoriesCount ?? 0) === 0) {
      console.warn(
        "[Catálogo] Sin categorías: comprueba migración 00008, filas en `categories`, RLS (policy SELECT) y la consola del servidor por errores.",
      );
    }
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
      })),
    );
    console.groupEnd();
  }, [products, categoriesCount]);

  return null;
}
