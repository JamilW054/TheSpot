"use client";

import type { CanvasElement } from "@/types";
import { CanvasDropZone } from "./canvas-drop-zone";
import { CanvasElementNodes } from "./canvas-element-nodes";

export const CANVAS_DROPPABLE_ID = "canvas-drop-zone";

export interface CanvasEditorProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onClearSelection: () => void;
}

export function CanvasEditor({
  elements,
  selectedId,
  onSelectElement,
  onClearSelection,
}: CanvasEditorProps) {
  return (
    <div
      className="relative flex flex-1 min-w-0 flex-col border border-dashed border-border bg-muted/20"
      aria-label="Área de diseño"
    >
      <CanvasDropZone
        id={CANVAS_DROPPABLE_ID}
        onBackgroundClick={onClearSelection}
      >
        <CanvasElementNodes
          elements={elements}
          selectedId={selectedId}
          onSelectElement={onSelectElement}
        />
      </CanvasDropZone>
    </div>
  );
}
