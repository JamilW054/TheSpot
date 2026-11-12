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
 * Panel general de la plataforma (`/admin`): el dueño del marketplace aprueba
 * tiendas, modera productos y ve pedidos/ventas de todas las tiendas. La
 * operación diaria de su propia tienda (The Spot oficial) va en `/panel`.
 */
export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard", adminSection: "Resumen" },
  { label: "Tiendas", href: "/admin/tiendas", icon: "Store", adminSection: "Marketplace" },
  { label: "Moderación", href: "/admin/moderacion", icon: "ShieldAlert", adminSection: "Marketplace" },
  { label: "Pedidos", href: "/admin/pedidos", icon: "ShoppingCart", adminSection: "Ventas" },
  { label: "Reporte de ventas", href: "/admin/ventas", icon: "BarChart3", adminSection: "Ventas" },
  { label: "Productos", href: "/admin/catalogo", icon: "Package", adminSection: "Catálogo global" },
  { label: "Categorías", href: "/admin/categorias", icon: "Layers", adminSection: "Catálogo global" },
  { label: "Marcas", href: "/admin/marcas", icon: "Tag", adminSection: "Catálogo global" },
  { label: "Tallas y tamaños", href: "/admin/tamanos", icon: "Ruler", adminSection: "Catálogo global" },
  { label: "Configuración", href: "/admin/config", icon: "Settings", adminSection: "Sistema" },
  { label: "Mi tienda (panel)", href: "/panel", icon: "ArrowRightLeft", adminSection: "Sistema" },
];

/**
 * Panel de cada tienda (`/panel`). Mismos segmentos que `/admin` para que los
 * componentes compartidos construyan enlaces con `usePanelBase()`.
 */
export const SELLER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/panel", icon: "LayoutDashboard", adminSection: "Resumen" },
  { label: "Pedidos", href: "/panel/pedidos", icon: "ShoppingCart", adminSection: "Ventas" },
  { label: "Reporte de ventas", href: "/panel/ventas", icon: "BarChart3", adminSection: "Ventas" },
  { label: "Pagos y cuentas", href: "/panel/pagos", icon: "Landmark", adminSection: "Ventas" },
  { label: "Productos", href: "/panel/catalogo", icon: "Package", adminSection: "Catálogo" },
  { label: "Inventario", href: "/panel/inventario", icon: "Boxes", adminSection: "Catálogo" },
  { label: "Cupones", href: "/panel/cupones", icon: "Ticket", adminSection: "Marketing" },
  { label: "Métodos de envío", href: "/panel/envios", icon: "Truck", adminSection: "Logística" },
  { label: "Mi tienda", href: "/panel/tienda", icon: "Store", adminSection: "Tienda" },
];
