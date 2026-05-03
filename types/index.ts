/**
 * Buxxep core types — single source of truth for app entities.
 * Designs, lineas, orders, canvas elements, mockups.
 */

export interface Design {
  id: string;
  slug: string;
  name: string;
  description: string;
  updated: string;
  coverImage: string;
  gallery: string[];
  /** Canvas state for the editor; when present, editor loads with these elements. */
  canvasElements?: CanvasElement[];
}

export interface Linea {
  id: string;
  slug: string;
  name: string;
  description: string;
  items: number;
  published: boolean;
  coverImage: string;
  gallery: string[];
  /** Optional product names for "Productos de esta línea". If absent, UI shows placeholders. */
  products?: string[];
}

export type {
  OrderPaymentStatus,
  Pedido,
  PedidoEstado,
  OrderStatusDetail,
  OrderStatusDetailItem,
} from "./pedido";
export type { PaymentResult } from "./payment";

export type CanvasElementType = "image" | "text" | "shape" | "path";

/** Tipo de forma para type "shape". */
export type ShapeKind = "rect" | "circle" | "triangle" | "star" | "polygon";

/** Puntos de un trazo de pincel en coordenadas lógicas del canvas (ej. [[x,y],[x,y],...]). */
export type PathPoint = [number, number];

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  /** Default true when undefined. When false, element is not drawn on canvas. */
  visible?: boolean;
  /** Bloqueado: no se puede mover ni editar por arrastre. */
  locked?: boolean;
  /** Agrupación: mismo groupId = mismo grupo. */
  groupId?: string;
  /** Solo para type "path": array de [x,y] en coords lógicas (JSON string). */
  pathData?: string;
  /** Solo para type "path": color del trazo (hex). */
  strokeColor?: string;
  /** Solo para type "path": grosor del trazo en px lógicos. */
  strokeWidth?: number;
  /** Solo para type "path": estilo de punta (round=suave, square=corte, marker=grueso). */
  brushStyle?: "round" | "square" | "marker";
  /** Solo para type "path": URL de imagen como textura del trazo (opcional). */
  brushTexture?: string;
  /** Solo para type "shape": rect | circle | triangle | star | polygon. */
  shapeKind?: ShapeKind;
  /** Solo para type "shape": color de relleno (hex). */
  fillColor?: string;
  /** Solo para type "shape": color de borde (hex). Default si no se define. */
  shapeStrokeColor?: string;
  /** Solo para type "shape": grosor de borde en px. */
  shapeStrokeWidth?: number;
  /** Opacidad 0-1. Aplica a shape y text. */
  opacity?: number;
  /** Solo para type "shape": radio de esquinas en px (rect). */
  borderRadius?: number;
  /** Solo para type "shape": sombra CSS (ej. "0 2px 8px rgba(0,0,0,0.15)"). */
  boxShadow?: string;
  /** Solo para type "text": tamaño en px. */
  fontSize?: number;
  /** Solo para type "text": familia de fuente. */
  fontFamily?: string;
  /** Solo para type "text": color del texto (hex). */
  textColor?: string;
  /** Solo para type "text": espaciado entre letras (px). */
  letterSpacing?: number;
  /** Solo para type "text": interlineado (múltiplo, ej. 1.5). */
  lineHeight?: number;
  /** Solo para type "text": left | center | right. */
  textAlign?: "left" | "center" | "right";
}

export type MockupCategory = "2d" | "3d";

export interface Mockup {
  id: string;
  name: string;
  category: MockupCategory;
  /** Optional image URL or path for preview (e.g. /mockups/shirt.svg or external URL). */
  imageUrl?: string;
  /** Legacy / opcional: ya no se usa para cargar geometría en el cliente. */
  modelPath?: string;
}

/** Producto del catálogo público: ropa a la venta que se puede personalizar en el editor. */
export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Precio en DOP (string formateado para mostrar). */
  price: string;
  /** Precio en céntimos para cálculos (total carrito, etc.). */
  priceCents: number;
  /** Legacy en DB; la UI usa portada y texturas planas. */
  modelPath?: string | null;
  /** Imagen de portada para la ficha y el listado. */
  coverImage: string;
  /** URL de la textura base (tabla textures) para la vista previa. */
  baseTextureUrl?: string | null;
}

/** Línea del carrito: producto + cantidad; opcionalmente diseño personalizado. */
export interface CartItem {
  productId: string;
  quantity: number;
  /** Si viene del editor, id del diseño personalizado (opcional). */
  designId?: string | null;
}

// Re-export domain-specific types
export type {
  FilterEstado,
  PedidosTableProps,
  PedidosTableBodyProps,
} from "./admin";
