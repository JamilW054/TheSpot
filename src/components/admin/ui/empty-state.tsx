import type { ReactNode } from "react";

export interface EmptyStateProps {
  /** Icono lucide de trazo fino. */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Acción principal (botón o enlace). */
  action?: ReactNode;
  className?: string;
}

/** Estado vacío consistente: icono en cápsula tonal, título y CTA opcional. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-6 py-14 text-center ${className}`.trim()}
    >
      {icon ? (
        <span
          className="flex size-12 items-center justify-center rounded-[18px] bg-muted text-muted-foreground"
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
