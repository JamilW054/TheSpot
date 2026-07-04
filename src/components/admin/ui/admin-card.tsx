import type { HTMLAttributes } from "react";

/**
 * Superficie de tarjeta del admin (DESIGN.md): paper #fff, radio 24px,
 * borde hairline + sombra "whisper-quiet" (ring 1px + elevación 1-2px).
 */
export function AdminCard({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-border bg-card text-card-foreground admin-card-shadow ${className}`.trim()}
      {...props}
    />
  );
}

/** Franja de cabecera dentro de una AdminCard (radios asimétricos arriba). */
export function AdminCardHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-t-3xl border-b border-border px-5 py-4 ${className}`.trim()}
      {...props}
    />
  );
}

export function AdminCardTitle({
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-sm font-semibold tracking-tight text-foreground ${className}`.trim()}
      {...props}
    />
  );
}

export function AdminCardContent({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-5 ${className}`.trim()} {...props} />;
}

/** Franja de pie dentro de una AdminCard (radios asimétricos abajo). */
export function AdminCardFooter({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center gap-3 rounded-b-3xl border-t border-border px-5 py-3 ${className}`.trim()}
      {...props}
    />
  );
}
