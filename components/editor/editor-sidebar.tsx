"use client";

import { useDraggable } from "@dnd-kit/core";
import { Image, Square, Type } from "lucide-react";
import type { EditorTool } from "@/config/editor-tools";
import { EDITOR_TOOLS } from "@/config/editor-tools";
import { Button } from "@/components/ui/button";

const ICON_BY_NAME: Record<string, React.ComponentType<{ className?: string }>> = {
  Image,
  Type,
  Square,
};

function DraggableTool({ tool }: { tool: EditorTool }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: tool.id,
    data: { type: tool.type },
  });

  const Icon = tool.iconName ? ICON_BY_NAME[tool.iconName] : null;

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        aria-pressed={isDragging}
      >
        {Icon != null ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
        <span>{tool.label}</span>
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
        {EDITOR_TOOLS.map((tool) => (
          <DraggableTool key={tool.id} tool={tool} />
        ))}
        <p className="text-xs text-muted-foreground">
          Arrastra una herramienta al canvas para añadir elementos.
        </p>
      </div>
    </aside>
  );
}
