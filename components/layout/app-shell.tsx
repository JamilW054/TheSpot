"use client";

import { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { Navbar } from "./navbar";
import type { NavbarUser } from "./navbar";

export type AppShellVariant = "app" | "admin";

export interface AppShellProps {
  children: React.ReactNode;
  variant?: AppShellVariant;
  /** Usuario para la barra superior (opcional; puede venir de AuthContext más adelante) */
  user?: NavbarUser | null;
  /** Callback cerrar sesión (opcional) */
  onLogout?: () => void;
}

const SHELL_HOME: Record<
  AppShellVariant,
  { href: string; label: string }
> = {
  app: { href: "/mis-disenos", label: "Buxxep" },
  admin: { href: "/admin", label: "Buxxep Admin" },
};

export function AppShell({
  children,
  variant = "app",
  user,
  onLogout,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { href: homeHref, label: homeLabel } = SHELL_HOME[variant];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar
        variant={variant}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar
          homeHref={homeHref}
          homeLabel={homeLabel}
          user={user}
          onLogout={onLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
