"use client";

import {
  BarChart2,
  Bell,
  FileText,
  FolderTree,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  PanelLeftClose,
  PlusCircle,
  Ruler,
  Settings,
  Shirt,
  ShoppingCart,
  Store,
  Tag,
  Ticket,
  Truck,
  Wallet,
  Warehouse,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import type { NavItem } from "@/config/navigation";
import { ADMIN_NAV, APP_NAV } from "@/config/navigation";
import { ROLE } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth-context";

export type SidebarVariant = "app" | "admin";

const NAV_BY_VARIANT: Record<SidebarVariant, NavItem[]> = {
  app: APP_NAV,
  admin: ADMIN_NAV,
};

const APP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Layers,
  Package,
  HelpCircle,
  Store,
};

const ADMIN_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Store,
  Layers,
  PlusCircle,
  Ruler,
  Shirt,
  BarChart2,
  Settings,
  FolderTree,
  Tag,
  Image: ImageIcon,
  Ticket,
  Zap,
  Bell,
  Truck,
  Wallet,
  Warehouse,
  HelpCircle,
};

function navItemActive(
  pathname: string,
  itemHref: string,
  items: NavItem[],
): boolean {
  if (pathname === itemHref) return true;
  if (itemHref === "/" || itemHref === "/admin") return false;
  if (!pathname.startsWith(`${itemHref}/`)) return false;
  const hasMoreSpecific = items.some(
    (o) =>
      o.href !== itemHref &&
      o.href.startsWith(`${itemHref}/`) &&
      (pathname === o.href || pathname.startsWith(`${o.href}/`)),
  );
  return !hasMoreSpecific;
}

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
  const { user, logout } = useAuth();
  const rawItems = NAV_BY_VARIANT[variant];
  const items =
    variant === "app"
      ? rawItems.filter((item) => !item.adminOnly || user?.role === ROLE.ADMIN)
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
          flex flex-col border-r border-border
          ${variant === "admin" ? "bg-(--admin-sidebar)" : "bg-card"}
          shadow-sm
          transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:transition-none
          ${hiddenOnDesktop ? "md:-translate-x-full md:w-0 md:overflow-hidden md:border-r-0 md:shadow-none" : "md:translate-x-0"}
        `}
      >
        <div className="scrollbar-hide flex flex-1 flex-col overflow-y-auto py-4 px-3">
          <div className="flex items-center justify-between gap-2 px-2 mb-5">
            <div className="flex flex-col">
              <span
                className={`text-[15px] font-semibold tracking-tight ${
                  variant === "admin"
                    ? "text-(--admin-brand-strong)"
                    : "text-primary"
                }`}
              >
                Buxxep
              </span>
              {variant === "admin" && (
                <span className="text-[11px] text-muted-foreground">
                  Panel admin
                </span>
              )}
            </div>
            {onCollapsedChange && (
              <button
                type="button"
                onClick={() => onCollapsedChange(true)}
                className="rounded-[10px] p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Ocultar menú"
              >
                <PanelLeftClose className="size-4" />
              </button>
            )}
          </div>

          <nav className="flex flex-col gap-1">
            {items.map((item, index) => {
              const prev = items[index - 1];
              const showSectionHeading =
                variant === "admin" &&
                item.adminSection &&
                item.adminSection !== prev?.adminSection;
              const isActive =
                variant === "admin"
                  ? navItemActive(pathname, item.href, rawItems)
                  : pathname === item.href ||
                    (item.href !== "/" &&
                      item.href !== "/admin" &&
                      (pathname.startsWith(`${item.href}/`) ||
                        pathname === item.href));
              const iconMap = variant === "admin" ? ADMIN_ICONS : APP_ICONS;
              const Icon = item.icon ? iconMap[item.icon] : null;
              return (
                <Fragment key={`${item.href}-${item.label}`}>
                  {showSectionHeading ? (
                    <div
                      className={`px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${index === 0 ? "pb-1 pt-0" : "pb-1 pt-5"}`}
                    >
                      {item.adminSection}
                    </div>
                  ) : null}
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`
                    flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                    transition-colors duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card
                    ${
                      isActive
                        ? variant === "admin"
                          ? "bg-(--admin-brand-soft) text-(--admin-brand-strong)"
                          : "bg-primary/10 text-primary"
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
                </Fragment>
              );
            })}
          </nav>
        </div>

        {variant === "admin" && (
          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose?.();
              }}
              className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
