"use client";

import { useEffect } from "react";

const CLS = "scrollbar-hide-root";

/** Oculta la barra de scroll del viewport en rutas admin; el scroll con rueda/touch sigue funcionando. */
export function AdminViewportScrollbar() {
  useEffect(() => {
    document.documentElement.classList.add(CLS);
    document.body.classList.add(CLS);
    return () => {
      document.documentElement.classList.remove(CLS);
      document.body.classList.remove(CLS);
    };
  }, []);
  return null;
}
