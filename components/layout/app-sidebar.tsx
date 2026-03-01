"use client";

import {
  BarChart2,
  BookOpen,
  FolderOpen,
  HelpCircle,
  LayoutGrid,
  LayoutDashboard,
  MessageCircle,
  Package,
  PanelLeftClose,
  PenSquare,
  Settings,
  Shirt,
  ShoppingCart,
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
  Package,
  PenSquare,
  Shirt,
  BookOpen,
  FolderOpen,
  HelpCircle,
};

const ADMIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ShoppingCart,
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
  const items = NAV_BY_VARIANT[variant];

  const hiddenOnDesktop = collapsed;

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
          transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:transition-transform
          ${hiddenOnDesktop ? "md:-translate-x-full md:w-0 md:overflow-hidden md:border-r-0" : "md:translate-x-0"}
        `}
      >
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {variant === "admin" ? "Administración" : "Menú"}
            </p>
            {onCollapsedChange && (
              <button
                type="button"
                onClick={() => onCollapsedChange(true)}
                className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:flex"
                aria-label="Ocultar menú"
              >
                <PanelLeftClose className="size-4" />
              </button>
            )}
          </div>
          <nav className="flex flex-col gap-0.5">
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
          {variant === "admin" && (
            <>
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-xs italic text-muted-foreground">
                  &ldquo;El trabajo de hoy era lo imposible de ayer.&rdquo;
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  — Robert H. Schuller
                </p>
              </div>
              <Link
                href="/soporte"
                onClick={onClose}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MessageCircle className="size-4" />
                Chatea con nosotros
              </Link>
            </>
          )}
          {variant === "app" && user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Vista Admin
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
