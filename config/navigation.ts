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

/** App autenticada: mis diseños, editor, líneas, guía, recursos, soporte */
export const APP_NAV: NavItem[] = [
  { label: "Mis diseños", href: "/mis-disenos", icon: "LayoutGrid" },
  { label: "Editor", href: "/editor", icon: "PenSquare" },
  { label: "Líneas de ropa", href: "/lineas", icon: "Shirt" },
  { label: "Guía", href: "/guia", icon: "BookOpen" },
  { label: "Recursos", href: "/recursos", icon: "FolderOpen" },
  { label: "Soporte", href: "/soporte", icon: "HelpCircle" },
];

/** Admin: dashboard, pedidos, configuración */
export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Pedidos", href: "/admin/pedidos" },
  { label: "Configuración", href: "/admin/config" },
];
