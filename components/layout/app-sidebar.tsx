"use client";

import {
  BookOpen,
  FolderOpen,
  HelpCircle,
  LayoutGrid,
  PenSquare,
  Shirt,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { APP_NAV, ADMIN_NAV } from "@/config/navigation";
import type { NavItem } from "@/config/navigation";

export type SidebarVariant = "app" | "admin";

const NAV_BY_VARIANT: Record<SidebarVariant, NavItem[]> = {
  app: APP_NAV,
  admin: ADMIN_NAV,
};

const APP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  PenSquare,
  Shirt,
  BookOpen,
  FolderOpen,
  HelpCircle,
};

export interface AppSidebarProps {
  variant?: SidebarVariant;
  open?: boolean;
  onClose?: () => void;
}

export function AppSidebar({
  variant = "app",
  open = false,
  onClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = NAV_BY_VARIANT[variant];

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        aria-label={
          variant === "admin"
            ? "Navegación de administración"
            : "Navegación de la aplicación"
        }
        className={`
          fixed md:sticky top-0 left-0 z-50 h-full w-72 shrink-0
          flex flex-col border-r border-border bg-background
          transition-transform duration-200 ease-out md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex flex-1 flex-col p-4">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {variant === "admin" ? "Administración" : "Menú"}
          </p>
          <nav className="flex flex-col gap-0.5">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon ? APP_ICONS[item.icon] : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-colors duration-150
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                    ${
                      isActive
                        ? "border-l-2 border-primary bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent"
                    }
                  `}
                >
                  {Icon != null ? (
                    <Icon className="size-5 shrink-0 opacity-80" aria-hidden />
                  ) : (
                    <span className="size-5 shrink-0" aria-hidden />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-border p-4">
          {variant === "app" && user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Vista Admin
            </Link>
          )}
          {variant === "admin" && (
            <Link
              href="/mis-disenos"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Vista Cliente
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
