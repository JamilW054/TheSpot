"use client";

import type { CanvasElement } from "@/types";
import dynamic from "next/dynamic";
import { forwardRef } from "react";
import { CanvasDropZone } from "./canvas-drop-zone";

const MockupViewer3D = dynamic(
  () => import("./MockupViewer3D").then((m) => ({ default: m.MockupViewer3D })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[500px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <span className="text-sm font-medium">Cargando modelo 3D…</span>
        <span className="text-xs">Puede tardar unos segundos</span>
      </div>
    ),
  }
);

export const CANVAS_DROPPABLE_ID = "canvas-drop-zone";

/** Logical design size used for element positions (matches render-design-to-texture). */
export const LOGICAL_WIDTH = 400;
export const LOGICAL_HEIGHT = 300;

export interface EditorCanvasAreaProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onClearSelection: () => void;
  show3DViewer?: {
    modelPath: string;
    textureUrl: string | null;
    rotation?: number;
    zoom?: number;
    onUVBoundsDetected?: (bounds: { u0: number; v0: number; u1: number; v1: number }) => void;
  } | null;
  zoomPercent?: number;
  onZoomChange?: (delta: number) => void;
  onPan?: (direction: "up" | "down" | "left" | "right") => void;
}

export const EditorCanvasArea = forwardRef<HTMLDivElement, EditorCanvasAreaProps>(function EditorCanvasArea({
  elements,
  selectedId,
  onSelectElement,
  onClearSelection,
  show3DViewer = null,
  zoomPercent = 100,
  onZoomChange,
  onPan,
}, ref) {
  return (
    <main
      ref={ref}
      className="editor-canvas-grid relative flex flex-1 min-w-0 flex-col items-center justify-center overflow-hidden border-r border-border"
      aria-label="Vista 3D del diseño"
    >
      <CanvasDropZone id={CANVAS_DROPPABLE_ID} onBackgroundClick={onClearSelection}>
        <div className="relative flex size-full min-h-[320px] flex-col items-center justify-center">
          {show3DViewer ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative size-full min-h-0 overflow-hidden">
                <MockupViewer3D
                  modelPath={show3DViewer.modelPath}
                  textureUrl={show3DViewer.textureUrl}
                  fullSize
                  rotation={show3DViewer.rotation}
                  zoom={show3DViewer.zoom}
                  onUVBoundsDetected={show3DViewer.onUVBoundsDetected}
                />
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Selecciona una prenda en el panel derecho para ver el modelo 3D
            </p>
          )}
        </div>
      </CanvasDropZone>

      <div
        className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full border border-border/80 bg-card/90 px-2 py-1.5 shadow-lg backdrop-blur-md"
        role="group"
        aria-label="Zoom"
      >
        <span className="min-w-10 text-center text-xs font-medium tabular-nums text-foreground">
          {zoomPercent}%
        </span>
        <div className="flex items-center border-l border-border/60 pl-2">
          <button
            type="button"
            onClick={() => onZoomChange?.(-10)}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Alejar"
          >
            <span className="text-base font-medium leading-none">−</span>
          </button>
          <button
            type="button"
            onClick={() => onZoomChange?.(10)}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Acercar"
          >
            <span className="text-base font-medium leading-none">+</span>
          </button>
        </div>
      </div>
    </main>
  );
});
