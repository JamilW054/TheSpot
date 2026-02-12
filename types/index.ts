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
}
