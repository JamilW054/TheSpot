import type { CanvasElementType } from "@/types";

/**
 * Editor tool definition for the canvas sidebar.
 * type matches CanvasElement so the sidebar can add elements to the canvas.
 */

export interface EditorTool {
  id: string;
  type: CanvasElementType;
  label: string;
  /** Lucide icon name (e.g. "Image", "Type", "Square") for optional use in UI */
  iconName?: string;
}

export const EDITOR_TOOLS: EditorTool[] = [
  { id: "tool-image", type: "image", label: "Imagen", iconName: "Image" },
  { id: "tool-text", type: "text", label: "Texto", iconName: "Type" },
  { id: "tool-shape", type: "shape", label: "Forma", iconName: "Square" },
  { id: "tool-brush", type: "path", label: "Pincel", iconName: "Pencil" },
];
