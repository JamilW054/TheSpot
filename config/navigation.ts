/**
 * Navigation config — single source of truth for routes and labels.
 * Consumed by layouts, sidebars, and navbars.
 */

export interface NavItem {
  label: string;
  href: string;
}

/** Público: landing, login, registro */
export const PUBLIC_NAV: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Login", href: "/login" },
  { label: "Registro", href: "/registro" },
];

/** App autenticada: mis diseños, editor, líneas, guía, recursos, soporte */
export const APP_NAV: NavItem[] = [
  { label: "Mis diseños", href: "/mis-disenos" },
  { label: "Editor", href: "/editor" },
  { label: "Líneas de ropa", href: "/lineas" },
  { label: "Guía", href: "/guia" },
  { label: "Recursos", href: "/recursos" },
  { label: "Soporte", href: "/soporte" },
];

/** Admin: dashboard, pedidos, configuración */
export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Pedidos", href: "/admin/pedidos" },
  { label: "Configuración", href: "/admin/config" },
];
