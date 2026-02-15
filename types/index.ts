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

export type CanvasElementType = "image" | "text" | "shape";

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
}

export type MockupCategory = "2d" | "3d";

export interface Mockup {
  id: string;
  name: string;
  category: MockupCategory;
  /** Optional image URL or path for preview (e.g. /mockups/shirt.svg or external URL). */
  imageUrl?: string;
  /** Path to 3D model (GLB) for 3d category, e.g. /models/male_tshirt.glb */
  modelPath?: string;
}

// Re-export domain-specific types
export type {
  FilterEstado,
  PedidosTableProps,
  PedidosTableBodyProps,
} from "./admin";
