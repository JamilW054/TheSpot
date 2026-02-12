"use client";

import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { CanvasElement } from "@/types";
import { useCallback, useState } from "react";
import { CanvasEditor, CANVAS_DROPPABLE_ID } from "./canvas-editor";
import { EditorRightPanel } from "./editor-right-panel";
import { EditorSidebar } from "./editor-sidebar";

const DEFAULT_TEXT_ELEMENT = {
  width: 120,
  height: 40,
  type: "text" as const,
  content: "Texto",
};

const DEFAULT_IMAGE_ELEMENT = {
  width: 160,
  height: 120,
  type: "image" as const,
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

export function EditorLayout() {
  const [elements, setElements] = useState<CanvasElement[]>([]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || over.id !== CANVAS_DROPPABLE_ID) return;

    const translated = active.rect.current.translated;
    const overRect = over.rect;
    if (!translated || !overRect) return;

    const x = translated.left - overRect.left;
    const y = translated.top - overRect.top;

    const dragType = active.data.current?.type as "text" | "image" | undefined;
    if (dragType === "image") {
      setElements((prev) => [...prev, createImageElement(x, y)]);
    } else {
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
        <CanvasEditor elements={elements} />
        <EditorRightPanel />
      </div>
    </DndContext>
  );
}
