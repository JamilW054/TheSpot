"use client";

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

const linkBase =
  "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card text-muted-foreground hover:bg-muted hover:text-foreground";

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
      {/* Backdrop móvil */}
      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity ${
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
          fixed md:sticky top-0 left-0 z-50 h-full w-64 shrink-0
          flex flex-col border-r border-border bg-card
          transition-transform duration-200 ease-out md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  rounded-md px-3 py-2 text-sm font-medium transition-colors
                  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* Cambio de vista para testing (solo si admin) */}
        <div className="border-t border-border p-3">
          {variant === "app" && user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={onClose}
              className={`block ${linkBase}`}
            >
              Vista Admin
            </Link>
          )}
          {variant === "admin" && (
            <Link
              href="/mis-disenos"
              onClick={onClose}
              className={`block ${linkBase}`}
            >
              Vista Cliente
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
