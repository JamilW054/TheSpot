/**
 * Navigation config — single source of truth for routes and labels.
 * Consumed by layouts, sidebars, and navbars.
 */

export interface NavItem {
  label: string;
  href: string;
  /** Lucide icon name for sidebar (optional). */
  icon?: string;
}

/** Público: landing, login, registro */
export const PUBLIC_NAV: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Login", href: "/login" },
  { label: "Registro", href: "/registro" },
];

/** App autenticada: mis diseños, mis pedidos, editor, líneas, guía, recursos, soporte */
export const APP_NAV: NavItem[] = [
  { label: "Mis diseños", href: "/mis-disenos", icon: "LayoutGrid" },
  { label: "Mis pedidos", href: "/mis-pedidos", icon: "Package" },
  { label: "Editor", href: "/editor", icon: "PenSquare" },
  { label: "Líneas de ropa", href: "/lineas", icon: "Shirt" },
  { label: "Guía", href: "/guia", icon: "BookOpen" },
  { label: "Recursos", href: "/recursos", icon: "FolderOpen" },
  { label: "Soporte", href: "/soporte", icon: "HelpCircle" },
];

/** Admin: dashboard, pedidos, líneas, reportes, configuración */
export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Pedidos", href: "/admin/pedidos", icon: "ShoppingCart" },
  { label: "Líneas", href: "/lineas", icon: "Shirt" },
  { label: "Reportes", href: "/admin/reportes", icon: "BarChart2" },
  { label: "Configuración", href: "/admin/config", icon: "Settings" },
];
