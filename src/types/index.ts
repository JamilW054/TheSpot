/**
 * The Spot — tipos núcleo, fuente única de verdad para las entidades de la app.
 */

export type {
  OrderPaymentStatus,
  Pedido,
  PedidoEstado,
  PedidoLineItem,
  PedidoShipping,
  OrderStatusDetail,
  OrderStatusDetailItem,
} from "./pedido";

/** Un color disponible: etiqueta visible + hex para el swatch (null si sin color). */
export interface ProductColor {
  label: string;
  hex: string | null;
}

/** Producto del catálogo público: un artículo a la venta. */
export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Precio en DOP (string formateado para mostrar). */
  price: string;
  /** Precio en céntimos para cálculos (total carrito, etc.). */
  priceCents: number;
  /** Precio anterior tachado (cuando hay oferta). */
  originalPrice?: string | null;
  originalPriceCents?: number | null;
  /** Nombre de la marca asociada. */
  brandName?: string | null;
  /** Imagen de portada para la ficha y el listado. */
  coverImage: string;
  /** Todas las imágenes del producto ordenadas (cover primero). */
  gallery: string[];
  /** Slug de categoría asociada en DB (null si sin categoría). */
  categorySlug: string | null;
  /** Tamaños disponibles para este producto, en ml (ej. ["30ml","50ml","100ml"]). */
  sizes: string[];
  /** Colores disponibles (eje independiente de las tallas). Vacío si no aplica. */
  colors: ProductColor[];
  /** Precio por variante en céntimos, indexado por `variantKey(size, color)`. */
  priceByVariant?: Record<string, number>;
  /** Etiquetas del producto. */
  tags: string[];
  /** Promedio de calificación (1-5). Null si sin reseñas. */
  ratingAvg: number | null;
  /** Cantidad total de reseñas. */
  reviewCount: number;
}

/** Línea del carrito: producto + cantidad, con talla/color opcionales. */
export interface CartItem {
  productId: string;
  quantity: number;
  /** Talla seleccionada por el usuario (null si el producto no tiene tallas). */
  size?: string | null;
  /** Color seleccionado por el usuario (null si el producto no tiene colores). */
  color?: string | null;
}

// Re-export domain-specific types
export type {
  FilterEstado,
  PedidosTableProps,
  PedidosTableBodyProps,
} from "./admin";
