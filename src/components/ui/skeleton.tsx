import type { HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional width (e.g. "100%", "12rem") */
  width?: string | number;
  /** Optional height (e.g. "2rem", 24) */
  height?: string | number;
}

export function Skeleton({
  className = "",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const resolvedStyle = {
    ...style,
    ...(width != null && {
      width: typeof width === "number" ? `${width}px` : width,
    }),
    ...(height != null && {
      height: typeof height === "number" ? `${height}px` : height,
    }),
  };

  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`animate-pulse rounded-md bg-muted ${className}`.trim()}
      style={Object.keys(resolvedStyle).length > 0 ? resolvedStyle : undefined}
      {...props}
    />
  );
}
