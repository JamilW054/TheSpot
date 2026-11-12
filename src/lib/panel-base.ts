"use client";

import { usePathname } from "next/navigation";

export type PanelBase = "/admin" | "/panel";

/**
 * Base de rutas del panel actual. Los componentes compartidos entre el panel
 * general (`/admin`) y el de tienda (`/panel`) construyen sus enlaces con esto
 * (`${base}/pedidos/${id}`) en vez de escribir `/admin` fijo.
 */
export function usePanelBase(): PanelBase {
  const pathname = usePathname() ?? "";
  return pathname === "/panel" || pathname.startsWith("/panel/")
    ? "/panel"
    : "/admin";
}
