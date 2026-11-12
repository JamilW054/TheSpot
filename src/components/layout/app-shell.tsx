"use client";

import { PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavItem } from "@/config/navigation";
import { AppSidebar } from "./app-sidebar";
import type { NavbarUser } from "./navbar";
import { Navbar } from "./navbar";

export interface AppShellProps {
  children: React.ReactNode;
  user?: NavbarUser | null;
  onLogout?: () => void;
  variant?: "admin" | "seller";
  storeName?: string | null;
  showAdminLink?: boolean;
  navOverride?: NavItem[];
}

/** Shell de los paneles: plataforma (`/admin`) y tienda (`/panel`). */
export function AppShell({
  children,
  user,
  onLogout,
  variant = "admin",
  storeName,
  showAdminLink,
  navOverride,
}: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        variant={variant}
        storeName={storeName}
        showAdminLink={showAdminLink}
        navOverride={navOverride}
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
          homeHref={variant === "seller" ? "/panel" : "/admin"}
          homeLabel={variant === "seller" ? (storeName ?? "Mi tienda") : "The Spot Admin"}
          homeLabelShort={variant === "seller" ? "Tienda" : "Admin"}
          hideCart
          user={user}
          onLogout={onLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 min-w-0 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-6">
          <div className="mx-auto w-full min-w-0 max-w-[1280px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
