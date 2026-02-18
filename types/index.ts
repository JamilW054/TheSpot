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

export type { Pedido, PedidoEstado } from "./pedido";

export type CanvasElementType = "image" | "text" | "shape" | "path";

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
}

export type MockupCategory = "2d" | "3d";

export interface Mockup {
  id: string;
  name: string;
  category: MockupCategory;
  /** Optional image URL or path for preview (e.g. /mockups/shirt.svg or external URL). */
  imageUrl?: string;
  /** Path to 3D model (GLB/GLTF) for 3d category, e.g. /models/tshirt/scene.gltf */
  modelPath?: string;
}

// Re-export domain-specific types
export type {
  FilterEstado,
  PedidosTableProps,
  PedidosTableBodyProps,
} from "./admin";
