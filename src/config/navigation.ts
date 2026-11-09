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
  /** Solo sidebar admin: encabezado de grupo antes de este ítem. */
  adminSection?: string;
}

/**
 * Panel administración (`/admin`), único login del sitio — no hay cuentas de
 * cliente. Rutas agrupadas por sección.
 */
export const ADMIN_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "LayoutDashboard",
    adminSection: "Resumen",
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
    icon: "ShoppingCart",
    adminSection: "Ventas",
  },
  {
    label: "Reporte de ventas",
    href: "/admin/ventas",
    icon: "BarChart3",
    adminSection: "Ventas",
  },
  {
    label: "Pagos y cuentas",
    href: "/admin/pagos",
    icon: "Landmark",
    adminSection: "Ventas",
  },
  {
    label: "Catálogo",
    href: "/admin/catalogo",
    icon: "Store",
    adminSection: "Catálogo",
  },
  {
    label: "Inventario",
    href: "/admin/inventario",
    icon: "Boxes",
    adminSection: "Catálogo",
  },
  {
    label: "Categorías",
    href: "/admin/categorias",
    icon: "Layers",
    adminSection: "Catálogo",
  },
  {
    label: "Marcas",
    href: "/admin/marcas",
    icon: "Tag",
    adminSection: "Catálogo",
  },
  {
    label: "Tallas y tamaños",
    href: "/admin/tamanos",
    icon: "Ruler",
    adminSection: "Catálogo",
  },
  {
    label: "Cupones",
    href: "/admin/cupones",
    icon: "Ticket",
    adminSection: "Marketing",
  },
  {
    label: "Métodos de envío",
    href: "/admin/envios",
    icon: "Truck",
    adminSection: "Logística",
  },
  {
    label: "Configuración",
    href: "/admin/config",
    icon: "Settings",
    adminSection: "Sistema",
  },
];
