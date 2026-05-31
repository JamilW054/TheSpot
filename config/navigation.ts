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
  /** Solo sidebar `variant="admin"`: encabezado de grupo antes de este ítem. */
  adminSection?: string;
}

/** Público: landing, login, registro */
export const PUBLIC_NAV: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Login", href: "/login" },
  { label: "Registro", href: "/registro" },
];

/** App autenticada: clientes ven diseños y pedidos; rutas adminOnly llevan al panel u operaciones de tienda */
export const APP_NAV: NavItem[] = [
  {
    label: "Panel admin",
    href: "/admin",
    icon: "LayoutDashboard",
    adminOnly: true,
  },
  {
    label: "Catálogo tienda",
    href: "/admin/catalogo",
    icon: "Store",
    adminOnly: true,
  },
  {
    label: "Categorías",
    href: "/admin/categorias",
    icon: "Layers",
    adminOnly: true,
  },
  { label: "Mis diseños", href: "/mis-disenos", icon: "LayoutGrid" },
  { label: "Mis pedidos", href: "/mis-pedidos", icon: "Package" },
];

/**
 * Panel administración (`/admin`): mismas herramientas con rutas agrupadas por sección.
 * Ventas → pedidos / facturas; Catálogo → productos; Estudio → editor y contenido.
 */
export const ADMIN_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "LayoutDashboard",
    adminSection: "Resumen",
  },
  {
    label: "Todos los pedidos",
    href: "/admin/pedidos",
    icon: "ShoppingCart",
    adminSection: "Ventas",
  },
  {
    label: "Facturas / cobros",
    href: "/admin/facturas",
    icon: "FileText",
    adminSection: "Ventas",
  },
  {
    label: "Catálogo",
    href: "/admin/catalogo",
    icon: "Store",
    adminSection: "Catálogo",
  },
  {
    label: "Categorías",
    href: "/admin/categorias",
    icon: "Layers",
    adminSection: "Catálogo",
  },
  {
    label: "Tipos de talla",
    href: "/admin/tallas",
    icon: "Ruler",
    adminSection: "Catálogo",
  },
  {
    label: "Nuevo artículo",
    href: "/admin/catalogo/nuevo",
    icon: "PlusCircle",
    adminSection: "Catálogo",
  },
  {
    label: "Reportes",
    href: "/admin/reportes",
    icon: "BarChart2",
    adminSection: "Sistema",
  },
  {
    label: "Configuración",
    href: "/admin/config",
    icon: "Settings",
    adminSection: "Sistema",
  },
];
