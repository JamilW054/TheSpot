import type { CanvasElementType, ShapeKind } from "@/types";

/**
 * Editor tool definition for the canvas sidebar.
 * Incluye tooltips y atajos para usabilidad avanzada.
 */

export interface EditorTool {
  id: string;
  type: CanvasElementType;
  label: string;
  iconName?: string;
  /** Solo para type "shape": rect, circle, triangle, star */
  shapeKind?: ShapeKind;
  /** Tooltip con atajo (ej. "Texto (T)") */
  tooltip?: string;
  /** Atajo de teclado sugerido */
  shortcut?: string;
}

export const EDITOR_TOOLS: EditorTool[] = [
  { id: "tool-image", type: "image", label: "Imagen", iconName: "Image", tooltip: "Imagen. Arrastra al canvas.", shortcut: "I" },
  { id: "tool-text", type: "text", label: "Texto", iconName: "Type", tooltip: "Texto. Arrastra al canvas. Doble clic para editar.", shortcut: "T" },
  { id: "tool-shape-rect", type: "shape", label: "Rectángulo", iconName: "Square", shapeKind: "rect", tooltip: "Rectángulo. Arrastra al canvas. Flechas: mover 1px.", shortcut: "R" },
  { id: "tool-shape-circle", type: "shape", label: "Círculo", iconName: "Circle", shapeKind: "circle", tooltip: "Círculo. Arrastra al canvas.", shortcut: "O" },
  { id: "tool-shape-triangle", type: "shape", label: "Triángulo", iconName: "Triangle", shapeKind: "triangle", tooltip: "Triángulo. Arrastra al canvas.", shortcut: "" },
  { id: "tool-shape-star", type: "shape", label: "Estrella", iconName: "Star", shapeKind: "star", tooltip: "Estrella. Arrastra al canvas.", shortcut: "" },
  { id: "tool-brush", type: "path", label: "Pincel", iconName: "Pencil", tooltip: "Pincel. Dibuja en el panel 2D.", shortcut: "B" },
];
