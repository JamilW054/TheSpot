/**
 * Navigation config — single source of truth for routes and labels.
 * Consumed by layouts, sidebars, and navbars.
 */

/** Ruta y etiqueta de la página de estado del pedido (público). */
export const ORDER_STATUS_PAGE = {
  href: "/estado-pedido",
  label: "Estado del pedido",
  ariaLabel: "Consultar estado del pedido",
} as const;

export interface NavItem {
  label: string;
  href: string;
  /** Lucide icon name for sidebar (optional). */
  icon?: string;
  /** Solo visible si user.role === "admin" (sidebar app). */
  adminOnly?: boolean;
}

/** Público: landing, login, registro */
export const PUBLIC_NAV: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Login", href: "/login" },
  { label: "Registro", href: "/registro" },
];

/** App autenticada: clientes ven diseños y pedidos; editor/líneas/guía/recursos/soporte solo admin */
export const APP_NAV: NavItem[] = [
  {
    label: "Panel admin",
    href: "/admin",
    icon: "LayoutDashboard",
    adminOnly: true,
  },
  { label: "Mis diseños", href: "/mis-disenos", icon: "LayoutGrid" },
  { label: "Mis pedidos", href: "/mis-pedidos", icon: "Package" },
  { label: "Editor", href: "/editor", icon: "PenSquare", adminOnly: true },
  { label: "Líneas de ropa", href: "/lineas", icon: "Shirt", adminOnly: true },
  { label: "Guía", href: "/guia", icon: "BookOpen", adminOnly: true },
  { label: "Recursos", href: "/recursos", icon: "FolderOpen", adminOnly: true },
  { label: "Soporte", href: "/soporte", icon: "HelpCircle", adminOnly: true },
];

/** Admin: dashboard, pedidos, líneas, reportes, configuración */
export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Pedidos", href: "/admin/pedidos", icon: "ShoppingCart" },
  { label: "Medios (R2)", href: "/admin/medios", icon: "Upload" },
  { label: "Líneas", href: "/lineas", icon: "Shirt" },
  { label: "Reportes", href: "/admin/reportes", icon: "BarChart2" },
  { label: "Configuración", href: "/admin/config", icon: "Settings" },
];
