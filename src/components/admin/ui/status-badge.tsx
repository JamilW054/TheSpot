import type { HTMLAttributes } from "react";

const toneStyles = {
  /** Cápsula tonal neutra (Badge — Soft). */
  neutral: "bg-muted text-foreground",
  /** Cápsula sólida de tinta (Badge — Solid). */
  solid: "bg-primary text-primary-foreground",
  /** Solo contorno hairline (Badge — Outline). */
  outline: "border border-border bg-transparent text-foreground",
  /** Acento de marca. */
  brand: "bg-(--admin-brand-soft) text-(--admin-brand-strong)",
  success: "bg-(--admin-success-soft) text-(--admin-success)",
  warning: "bg-(--admin-warning-soft) text-(--admin-warning)",
  danger: "bg-(--admin-danger-soft) text-(--admin-danger)",
} as const;

export type AdminBadgeTone = keyof typeof toneStyles;

export interface AdminBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: AdminBadgeTone;
  /** Muestra un punto de estado a la izquierda. */
  dot?: boolean;
}

/** Cápsula pill (radio 18px, 12px/500) según DESIGN.md. */
export function AdminBadge({
  tone = "neutral",
  dot = false,
  className = "",
  children,
  ...props
}: AdminBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[18px] px-2.5 py-0.5 text-xs font-medium ${toneStyles[tone]} ${className}`.trim()}
      {...props}
    >
      {dot ? (
        <span
          className="size-1.5 shrink-0 rounded-full bg-current"
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
}
