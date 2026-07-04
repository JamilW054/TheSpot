import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export interface AdminBreadcrumbItem {
  label: string;
  href?: string;
}

/** Rastro de migas puramente tipográfico (DESIGN.md: Breadcrumb Trail). */
export function AdminBreadcrumbs({ items }: { items: AdminBreadcrumbItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label="Ruta de navegación"
      className="flex items-center gap-1 text-sm"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight
                className="size-3.5 text-muted-foreground"
                aria-hidden
              />
            )}
          </span>
        );
      })}
    </nav>
  );
}

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: AdminBreadcrumbItem[];
  /** Acciones a la derecha (botones, enlaces). */
  actions?: ReactNode;
}

/**
 * Cabecera estándar de página del admin: migas opcionales, título
 * heading-sm (24px/600, tracking -0.6px) y acciones alineadas a la derecha.
 */
export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="space-y-2">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <AdminBreadcrumbs items={breadcrumbs} />
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
