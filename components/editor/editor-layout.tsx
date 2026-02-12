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
import { useCallback, useEffect, useRef, useState } from "react";
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

function createImageElement(x: number, y: number, content?: string): CanvasElement {
  return {
    id: crypto.randomUUID(),
    ...DEFAULT_IMAGE_ELEMENT,
    x,
    y,
    ...(content != null && { content }),
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

const DEFAULT_IMAGE_POS = { x: 50, y: 50 };

export function EditorLayout() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const objectUrlsByElementId = useRef<Map<string, string>>(new Map());

  const handleAddImageFromFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const el = createImageElement(DEFAULT_IMAGE_POS.x, DEFAULT_IMAGE_POS.y, url);
    objectUrlsByElementId.current.set(el.id, url);
    setElements((prev) => [...prev, el]);
  }, []);

  useEffect(() => {
    const ids = new Set(elements.map((el) => el.id));
    const ref = objectUrlsByElementId.current;
    for (const [id, url] of ref.entries()) {
      if (!ids.has(id)) {
        URL.revokeObjectURL(url);
        ref.delete(id);
      }
    }
  }, [elements]);

  useEffect(() => {
    return () => {
      for (const url of objectUrlsByElementId.current.values()) {
        URL.revokeObjectURL(url);
      }
      objectUrlsByElementId.current.clear();
    };
  }, []);

  const handleUpdateElement = useCallback((id: string, partial: CanvasElementPatch) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...partial } : el))
    );
  }, []);

  const handleMoveLayer = useCallback((id: string, direction: "up" | "down") => {
    setElements((prev) => {
      const i = prev.findIndex((el) => el.id === id);
      if (i === -1) return prev;
      if (direction === "up" && i < prev.length - 1) {
        const next = [...prev];
        [next[i], next[i + 1]] = [next[i + 1]!, next[i]!];
        return next;
      }
      if (direction === "down" && i > 0) {
        const next = [...prev];
        [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
        return next;
      }
      return prev;
    });
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
        <EditorSidebar onAddImageFromFile={handleAddImageFromFile} />
        <CanvasEditor
          elements={elements}
          selectedId={selectedId}
          onSelectElement={setSelectedId}
          onClearSelection={() => setSelectedId(null)}
        />
        <EditorRightPanel
          selectedId={selectedId}
          elements={elements}
          onSelectElement={setSelectedId}
          onMoveLayer={handleMoveLayer}
          onUpdateElement={handleUpdateElement}
          onClearSelection={() => setSelectedId(null)}
        />
      </div>
    </DndContext>
  );
}
