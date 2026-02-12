"use client";

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { CanvasElement, CanvasElementType } from "@/types";
import { useCallback, useState } from "react";
import { CanvasEditor, CANVAS_DROPPABLE_ID } from "./canvas-editor";
import { EditorRightPanel } from "./editor-right-panel";
import { EditorSidebar } from "./editor-sidebar";
import type { CanvasElementPatch } from "./properties-panel";

const DEFAULT_TEXT_ELEMENT = {
  width: 120,
  height: 40,
  type: "text" as const,
  content: "Nuevo texto",
};

const DEFAULT_IMAGE_ELEMENT = {
  width: 160,
  height: 120,
  type: "image" as const,
};

const DEFAULT_SHAPE_ELEMENT = {
  width: 100,
  height: 80,
  type: "shape" as const,
  content: "rect" as const,
};

function createTextElement(x: number, y: number): CanvasElement {
  return {
    id: crypto.randomUUID(),
    ...DEFAULT_TEXT_ELEMENT,
    x,
    y,
  };
}

function createImageElement(x: number, y: number): CanvasElement {
  return {
    id: crypto.randomUUID(),
    ...DEFAULT_IMAGE_ELEMENT,
    x,
    y,
  };
}

function createShapeElement(x: number, y: number): CanvasElement {
  return {
    id: crypto.randomUUID(),
    ...DEFAULT_SHAPE_ELEMENT,
    x,
    y,
  };
}

export function EditorLayout() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleUpdateElement = useCallback((id: string, partial: CanvasElementPatch) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...partial } : el))
    );
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || over.id !== CANVAS_DROPPABLE_ID) return;

    const translated = active.rect.current.translated;
    const overRect = over.rect;
    if (!translated || !overRect) return;

    const x = translated.left - overRect.left;
    const y = translated.top - overRect.top;

    const dragType = active.data.current?.type as CanvasElementType | undefined;
    if (dragType === "image") {
      setElements((prev) => [...prev, createImageElement(x, y)]);
    } else if (dragType === "shape") {
      setElements((prev) => [...prev, createShapeElement(x, y)]);
    } else if (dragType === "text") {
      setElements((prev) => [...prev, createTextElement(x, y)]);
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        className="flex h-full min-h-0 w-full flex-row"
        role="application"
        aria-label="Editor de diseños"
      >
        <EditorSidebar />
        <CanvasEditor
          elements={elements}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
          onClearSelection={() => setSelectedId(null)}
        />
        <EditorRightPanel
          selectedId={selectedId}
          elements={elements}
          onUpdateElement={handleUpdateElement}
          onClearSelection={() => setSelectedId(null)}
        />
      </div>
    </DndContext>
  );
}
