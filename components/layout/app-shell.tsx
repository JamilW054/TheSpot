"use client";

import { PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { Navbar } from "./navbar";
import type { NavbarUser } from "./navbar";

export type AppShellVariant = "app" | "admin";

export interface AppShellProps {
  children: React.ReactNode;
  variant?: AppShellVariant;
  user?: NavbarUser | null;
  onLogout?: () => void;
}

const SHELL_HOME: Record<AppShellVariant, { href: string; label: string }> = {
  app: { href: "/mis-disenos", label: "Buxxep" },
  admin: { href: "/admin", label: "Buxxep Admin" },
};

export function AppShell({
  children,
  variant = "app",
  user,
  onLogout,
}: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const { href: homeHref, label: homeLabel } = SHELL_HOME[variant];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar
        variant={variant}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      {sidebarCollapsed && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed(false)}
          className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 rounded-r-lg border border-l-0 border-border bg-background/95 px-2 py-4 shadow-md hover:bg-muted md:flex md:items-center md:justify-center"
          aria-label="Mostrar menú"
        >
          <PanelLeft className="size-5 text-muted-foreground" />
        </button>
      )}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar
          homeHref={homeHref}
          homeLabel={homeLabel}
          homeLabelShort={variant === "admin" ? "Admin" : undefined}
          hideCart={variant === "admin"}
          user={user}
          onLogout={onLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 min-w-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-6">
          <div className="mx-auto w-full min-w-0 max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
