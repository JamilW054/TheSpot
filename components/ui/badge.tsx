import type { HTMLAttributes } from "react";

const variantStyles = {
  default:
    "bg-muted text-muted-foreground border-border",
  success:
    "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700",
  warning:
    "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
  destructive:
    "bg-destructive/10 text-destructive border-destructive/30 dark:bg-destructive/20 dark:border-destructive/50",
} as const;

export type BadgeVariant = keyof typeof variantStyles;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  children,
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      role="status"
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
