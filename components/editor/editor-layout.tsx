"use client";

import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { renderElementsToTextureUrl } from "@/lib/render-design-to-texture";
import type { CanvasElement, CanvasElementType } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ElementContent } from "./canvas-element-nodes";
import {
  CANVAS_DROPPABLE_ID,
  CANVAS_DROPPABLE_ID_2D,
  EditorCanvasArea,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
} from "./EditorCanvasArea";
import { EditorHeader } from "./EditorHeader";
import { EditorRightPanel } from "./editor-right-panel";
import { EditorToolbar } from "./EditorToolbar";
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

export interface EditorLayoutProps {
  /** Initial canvas elements when editing an existing design (e.g. from ?design=id). */
  initialElements?: CanvasElement[];
  /** Design id when editing; used for future save. */
  designId?: string | null;
}

const ZOOM_MIN = 0.005;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.1;

export function EditorLayout({
  initialElements = [],
  designId = null,
}: EditorLayoutProps) {
  const [elements, setElements] = useState<CanvasElement[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected3DMockup, setSelected3DMockupState] = useState<{ modelPath: string } | null>(null);
  const viewMode = "3d" as const; // Single 3D view only (no 2D canvas)
  const setSelected3DMockup = useCallback((m: { modelPath: string } | null) => {
    setSelected3DMockupState(m);
    setRotation3d(0);
    setZoom3d(1);
  }, []);
  const [texture3dUrl, setTexture3dUrl] = useState<string | null>(null);
  const [rotation3d, setRotation3d] = useState(0);
  const [zoom3d, setZoom3d] = useState(1);
  const [garmentColor, setGarmentColor] = useState("#ffffff");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [designTextureUrl, setDesignTextureUrl] = useState<string | null>(null);
  const [modelUVBounds, setModelUVBounds] = useState<{ u0: number; v0: number; u1: number; v1: number } | null>(null);
  const objectUrlsByElementId = useRef<Map<string, string>>(new Map());

  // Al cambiar de modelo, limpiar bounds hasta que el nuevo GLB reporte los suyos
  useEffect(() => {
    setModelUVBounds(null);
  }, [selected3DMockup?.modelPath]);

  const zoomPercent = useMemo(() => Math.round(zoom3d * 100), [zoom3d]);
  const activeDragElement = activeDragId
    ? elements.find((el) => el.id === activeDragId)
    : null;

  // Render 2D elements to texture. UV bounds = leídos del GLB (geometry.attributes.uv) o config.
  useEffect(() => {
    let cancelled = false;
    if (elements.length === 0) {
      setDesignTextureUrl(null);
      return;
    }
    const modelPath = selected3DMockup?.modelPath;
    renderElementsToTextureUrl(elements, texture3dUrl, modelPath, modelUVBounds).then((url) => {
      if (!cancelled) setDesignTextureUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [elements, texture3dUrl, selected3DMockup?.modelPath, modelUVBounds]);

  const effectiveTexture3d = designTextureUrl ?? texture3dUrl;

  const getEffectiveTextureBlob = useCallback((): Promise<Blob | null> => {
    const url = effectiveTexture3d;
    if (!url) return Promise.resolve(null);
    // Data URL (del canvas con diseño): convertir a Blob sin fetch (más fiable)
    if (url.startsWith("data:")) {
      try {
        const [header, data] = url.split(",");
        const mime = header?.match(/:(.*?);/)?.[1] ?? "image/png";
        const bin = atob(data ?? "");
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        return Promise.resolve(new Blob([arr], { type: mime }));
      } catch {
        return Promise.resolve(null);
      }
    }
    return fetch(url).then((r) => r.blob()).catch(() => null);
  }, [effectiveTexture3d]);

  const handleZoomChange = useCallback((delta: number) => {
    setZoom3d((prev) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, prev + delta / 100)));
  }, []);

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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (event.active.data.current?.kind === "element") {
      setActiveDragId(String(event.active.id));
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    const isCanvasDrop = over && (over.id === CANVAS_DROPPABLE_ID || over.id === CANVAS_DROPPABLE_ID_2D);
    if (!over || !isCanvasDrop) return;

    const translated = active.rect.current.translated;
    const overRect = over.rect;
    if (!translated || !overRect) return;

    const px = translated.left - overRect.left;
    const py = translated.top - overRect.top;
    const w = overRect.width || 1;
    const h = overRect.height || 1;
    const x = Math.round((px / w) * LOGICAL_WIDTH);
    const y = Math.round((py / h) * LOGICAL_HEIGHT);
    const xClamp = Math.max(0, Math.min(LOGICAL_WIDTH - 20, x));
    const yClamp = Math.max(0, Math.min(LOGICAL_HEIGHT - 20, y));

    const isExistingElement = active.data.current?.kind === "element";
    const dragType = active.data.current?.type as CanvasElementType | undefined;

    if (isExistingElement && typeof active.id === "string") {
      setElements((prev) =>
        prev.map((el) =>
          el.id === active.id ? { ...el, x: xClamp, y: yClamp } : el
        )
      );
      return;
    }

    if (dragType === "image") {
      setElements((prev) => [...prev, createImageElement(xClamp, yClamp)]);
    } else if (dragType === "shape") {
      setElements((prev) => [...prev, createShapeElement(xClamp, yClamp)]);
    } else if (dragType === "text") {
      setElements((prev) => [...prev, createTextElement(xClamp, yClamp)]);
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const projectName = designId ?? "proyecto";

  const getCanvasAsBlob = useCallback((): Promise<Blob | null> => {
    const container = canvasContainerRef.current;
    const canvas = container?.querySelector("canvas");
    if (!canvas) return Promise.resolve(null);
    return new Promise((resolve) => {
      try {
        canvas.toBlob(
          (blob) => resolve(blob ?? null),
          "image/png",
          0.92
        );
      } catch {
        resolve(null);
      }
    });
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex h-full min-h-0 w-full flex-col"
        role="application"
        aria-label="Editor de diseños"
      >
        <EditorHeader projectName={designId ?? "Nuevo diseño"} />
        <div className="flex min-h-0 flex-1 flex-row">
          <EditorToolbar onAddImageFromFile={handleAddImageFromFile} />
          <EditorCanvasArea
            ref={canvasContainerRef}
            elements={elements}
            selectedId={selectedId}
            onSelectElement={setSelectedId}
            onClearSelection={() => setSelectedId(null)}
            show3DViewer={
              selected3DMockup
                ? {
                    modelPath: selected3DMockup.modelPath,
                    textureUrl: effectiveTexture3d,
                    rotation: rotation3d,
                    zoom: zoom3d,
                    garmentColorHex: garmentColor,
                    onUVBoundsDetected: setModelUVBounds,
                  }
                : null
            }
            zoomPercent={zoomPercent}
            onZoomChange={handleZoomChange}
          />
          <EditorRightPanel
          selectedId={selectedId}
          elements={elements}
          onSelectElement={setSelectedId}
          onMoveLayer={handleMoveLayer}
          onUpdateElement={handleUpdateElement}
          onClearSelection={() => setSelectedId(null)}
          projectName={projectName}
          selected3DMockup={selected3DMockup}
          onSelect3DMockup={setSelected3DMockup}
          texture3dUrl={texture3dUrl}
          onTexture3dChange={setTexture3dUrl}
          garmentColor={garmentColor}
          onGarmentColorChange={setGarmentColor}
          rotation3d={rotation3d}
          zoom3d={zoom3d}
          onRotation3dChange={setRotation3d}
          onZoom3dChange={setZoom3d}
          getCanvasAsBlob={getCanvasAsBlob}
          getEffectiveTextureBlob={getEffectiveTextureBlob}
          />
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeDragElement ? (
          <div
            className="flex cursor-grabbing overflow-hidden rounded border-2 border-primary bg-background shadow-lg"
            style={{
              width: activeDragElement.width,
              height: activeDragElement.height,
            }}
          >
            <ElementContent el={activeDragElement} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
