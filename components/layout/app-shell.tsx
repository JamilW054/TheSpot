"use client";

import { useState } from "react";
import Link from "next/link";
import { AppSidebar } from "./app-sidebar";

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  );
}

export type AppShellVariant = "app" | "admin";

export interface AppShellProps {
  children: React.ReactNode;
  variant?: AppShellVariant;
}

const SHELL_HOME_HREF: Record<AppShellVariant, string> = {
  app: "/mis-disenos",
  admin: "/admin",
};

export function AppShell({ children, variant = "app" }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const homeHref = SHELL_HOME_HREF[variant];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar
        variant={variant}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/95 px-4 supports-backdrop-filter:bg-background/60 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </button>
          <Link
            href={homeHref}
            className="font-semibold text-foreground hover:opacity-90"
          >
            Buxxep {variant === "admin" ? "Admin" : ""}
          </Link>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
