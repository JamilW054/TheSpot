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

export type PedidoEstado = "pendiente" | "en_proceso" | "completado";

export interface Pedido {
  id: string;
  cliente: string;
  items: number;
  total: string;
  estado: PedidoEstado;
}

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
}
