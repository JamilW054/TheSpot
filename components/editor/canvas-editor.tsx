"use client";

import type { CanvasElement } from "@/types";
import { CanvasDropZone } from "./canvas-drop-zone";
import { CanvasElementNodes } from "./canvas-element-nodes";

export const CANVAS_DROPPABLE_ID = "canvas-drop-zone";

export interface CanvasEditorProps {
  elements: CanvasElement[];
}

export function CanvasEditor({ elements }: CanvasEditorProps) {
  return (
    <div
      className="relative flex flex-1 min-w-0 flex-col border border-dashed border-border bg-muted/20"
      aria-label="Área de diseño"
    >
      <CanvasDropZone id={CANVAS_DROPPABLE_ID}>
        <CanvasElementNodes elements={elements} />
      </CanvasDropZone>
    </div>
  );
}
