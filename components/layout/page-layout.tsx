import type { HTMLAttributes } from "react";

export interface PageLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Título de la página (se muestra como H1) */
  title: string;
  /** Descripción opcional bajo el título */
  description?: string;
  children: React.ReactNode;
}

export function PageLayout({
  title,
  description,
  children,
  className = "",
  ...props
}: PageLayoutProps) {
  return (
    <div className={`space-y-6 max-w-4xl ${className}`.trim()} {...props}>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
