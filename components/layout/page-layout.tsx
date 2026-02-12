import type { HTMLAttributes } from "react";

export interface PageLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Título de la página (se muestra como H1) */
  title: string;
  children: React.ReactNode;
}

export function PageLayout({
  title,
  children,
  className = "",
  ...props
}: PageLayoutProps) {
  return (
    <div className={`space-y-6 ${className}`.trim()} {...props}>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
