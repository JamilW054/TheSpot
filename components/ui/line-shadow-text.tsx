"use client";

import type { HTMLAttributes } from "react";

const textOutlineShadow = [
  "1px 0 0 var(--primary)",
  "-1px 0 0 var(--primary)",
  "0 1px 0 var(--primary)",
  "0 -1px 0 var(--primary)",
  "1px 1px 0 var(--primary)",
  "-1px -1px 0 var(--primary)",
  "1px -1px 0 var(--primary)",
  "-1px 1px 0 var(--primary)",
].join(", ");

export interface LineShadowTextProps extends HTMLAttributes<HTMLSpanElement> {
  /** Texto a mostrar con efecto línea/sombra */
  children: React.ReactNode;
  /** Clase aplicada (ej. tamaño de fuente) */
  className?: string;
}

/**
 * Texto con efecto de contorno/sombra tipo Magic UI.
 * CSS text-shadow para la línea; sin degradados; colores del design system.
 */
export function LineShadowText({
  children,
  className = "",
  style,
  ...props
}: LineShadowTextProps) {
  return (
    <span
      className={`inline-block text-foreground ${className}`.trim()}
      style={{
        ...style,
        textShadow: textOutlineShadow,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
