import type { HTMLAttributes } from "react";

export interface PageLayoutProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
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
      <header className="space-y-0.5">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="text-[13px] text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
