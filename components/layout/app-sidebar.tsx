"use client";

import {
  BarChart2,
  BookOpen,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  LayoutGrid,
  MessageCircle,
  Package,
  PanelLeftClose,
  PenSquare,
  Settings,
  Shirt,
  ShoppingCart,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/navigation";
import { ADMIN_NAV, APP_NAV } from "@/config/navigation";
import { useAuth } from "@/lib/auth-context";

export type SidebarVariant = "app" | "admin";

const NAV_BY_VARIANT: Record<SidebarVariant, NavItem[]> = {
  app: APP_NAV,
  admin: ADMIN_NAV,
};

const APP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  LayoutGrid,
  Package,
  PenSquare,
  Shirt,
  BookOpen,
  FolderOpen,
  HelpCircle,
};

const ADMIN_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  LayoutDashboard,
  ShoppingCart,
  Upload,
  Shirt,
  BarChart2,
  Settings,
};

export interface AppSidebarProps {
  variant?: SidebarVariant;
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function AppSidebar({
  variant = "app",
  open = false,
  onClose,
  collapsed = false,
  onCollapsedChange,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const rawItems = NAV_BY_VARIANT[variant];
  const items =
    variant === "app"
      ? rawItems.filter((item) => !item.adminOnly || user?.role === "admin")
      : rawItems;
  const hiddenOnDesktop = collapsed;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-200 ${
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
          fixed md:sticky top-0 left-0 z-50 w-64 shrink-0
          min-h-screen h-screen
          flex flex-col bg-card border-r border-border
          shadow-sm
          transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:transition-none
          ${hiddenOnDesktop ? "md:-translate-x-full md:w-0 md:overflow-hidden md:border-r-0 md:shadow-none" : "md:translate-x-0"}
        `}
      >
        <div className="flex flex-1 flex-col overflow-y-auto py-5 px-3">
          <div className="flex items-center justify-between gap-2 px-3 mb-6">
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              {variant === "admin" ? "Admin" : "Navegación"}
            </span>
            {onCollapsedChange && (
              <button
                type="button"
                onClick={() => onCollapsedChange(true)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Ocultar menú"
              >
                <PanelLeftClose className="size-4" />
              </button>
            )}
          </div>

          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const iconMap = variant === "admin" ? ADMIN_ICONS : APP_ICONS;
              const Icon = item.icon ? iconMap[item.icon] : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                    transition-colors duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card
                    ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }
                  `}
                >
                  {Icon != null ? (
                    <Icon className="size-5 shrink-0" aria-hidden />
                  ) : (
                    <span className="size-5 shrink-0" aria-hidden />
                  )}
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-border p-3">
          {variant === "admin" && (
            <>
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs italic text-muted-foreground">
                  &ldquo;El trabajo de hoy era lo imposible de ayer.&rdquo;
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground/80">
                  — Robert H. Schuller
                </p>
              </div>
              <Link
                href="/soporte"
                onClick={onClose}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-muted/40 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MessageCircle className="size-4" />
                Soporte
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
