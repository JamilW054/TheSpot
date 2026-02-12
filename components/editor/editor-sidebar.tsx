"use client";

import { useDraggable } from "@dnd-kit/core";
import type { CanvasElementType } from "@/types";
import { EDITOR_TOOLS } from "@/config/editor-tools";
import { Button } from "@/components/ui/button";

const TOOL_TEXT_ID = "tool-text";
const TOOL_IMAGE_ID = "tool-image";
const TOOL_SHAPE_ID = "tool-shape";

const TOOL_LABELS: Record<CanvasElementType, string> = {
  text: "Texto",
  image: "Imagen",
  shape: "Forma",
};

function DraggableTool({
  toolId,
  type,
}: {
  toolId: string;
  type: CanvasElementType;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: toolId,
    data: { type },
  });

  const tool = EDITOR_TOOLS.find((t) => t.type === type);

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-start"
        aria-pressed={isDragging}
      >
        {tool?.label ?? TOOL_LABELS[type]}
      </Button>
    </div>
  );
}

/**
 * Sidebar izquierdo del editor: herramientas (herramientas de diseño, formas, texto, etc.).
 * Incluye draggables para añadir elementos al canvas por DnD.
 */
export function EditorSidebar() {
  return (
    <aside
      className="flex w-56 shrink-0 flex-col border-r border-border bg-muted/30 p-3"
      aria-label="Herramientas del editor"
    >
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Herramientas
      </h2>
      <div className="mt-3 flex flex-col gap-2">
        <DraggableTool toolId={TOOL_TEXT_ID} type="text" />
        <DraggableTool toolId={TOOL_IMAGE_ID} type="image" />
        <DraggableTool toolId={TOOL_SHAPE_ID} type="shape" />
        <p className="text-xs text-muted-foreground">
          Arrastra «Texto», «Imagen» o «Forma» al canvas para añadir elementos.
        </p>
      </div>
    </aside>
  );
}
