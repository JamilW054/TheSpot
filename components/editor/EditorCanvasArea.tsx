"use client";

import type { CanvasElement } from "@/types";
import dynamic from "next/dynamic";
import { forwardRef } from "react";
import { Box, Boxes, Network } from "lucide-react";
import { CanvasDropZone } from "./canvas-drop-zone";
import { GeometryNodesPanel } from "./GeometryNodesPanel";
import { TextureNodesPanel } from "./TextureNodesPanel";

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
/** ID del drop zone del editor 2D en el panel derecho (misma lógica de posición). */
export const CANVAS_DROPPABLE_ID_2D = "canvas-drop-zone-2d";

/** Logical design size used for element positions (matches render-design-to-texture). */
export const LOGICAL_WIDTH = 400;
export const LOGICAL_HEIGHT = 300;

export type CenterViewMode = "3d" | "nodes" | "geometry";

export interface EditorCanvasAreaProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onClearSelection: () => void;
  /** Vista central: 3D (modelo) o nodos de textura */
  centerViewMode?: CenterViewMode;
  onCenterViewModeChange?: (mode: CenterViewMode) => void;
  show3DViewer?: {
    modelPath: string;
    textureUrl: string | null;
    rotation?: number;
    zoom?: number;
    garmentColorHex?: string;
    onUVBoundsDetected?: (bounds: { u0: number; v0: number; u1: number; v1: number }) => void;
    onMeshInfoDetected?: (info: { vertexCount: number; faceCount: number }) => void;
    /** Conectado desde nodos de textura → aplica al modelo */
    onMaterialColorChange?: (hex: string) => void;
    onMaterialTextureChange?: (url: string | null) => void;
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
  centerViewMode = "3d",
  onCenterViewModeChange,
  show3DViewer = null,
  zoomPercent = 100,
  onZoomChange,
  onPan,
}, ref) {
  return (
    <main
      ref={ref}
      className="editor-canvas-grid relative flex flex-1 min-w-0 flex-col overflow-hidden border-r border-border"
      aria-label={centerViewMode === "nodes" ? "Nodos de textura" : centerViewMode === "geometry" ? "Nodos de geometría" : "Vista 3D del diseño"}
    >
      {/* Tabs centrales: Vista 3D | Nodos de textura */}
      {onCenterViewModeChange && (
        <div
          className="flex shrink-0 border-b border-border bg-muted/30 px-2 py-1"
          role="tablist"
          aria-label="Vista central"
        >
          <button
            type="button"
            role="tab"
            aria-selected={centerViewMode === "3d" ? "true" : "false"}
            onClick={() => onCenterViewModeChange("3d")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              centerViewMode === "3d"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Box className="size-4" />
            Vista 3D
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={centerViewMode === "nodes" ? "true" : "false"}
            onClick={() => onCenterViewModeChange("nodes")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              centerViewMode === "nodes"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Boxes className="size-4" />
            Nodos de textura
          </button>
        </div>
      )}

      {centerViewMode === "nodes" ? (
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-hidden p-4">
          <TextureNodesPanel
            modelPath={show3DViewer?.modelPath ?? null}
            fullView
            garmentColor={show3DViewer?.garmentColorHex ?? "#ffffff"}
            onMaterialColorChange={show3DViewer?.onMaterialColorChange}
            onMaterialTextureChange={show3DViewer?.onMaterialTextureChange}
          />
        </div>
      ) : centerViewMode === "geometry" ? (
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
          <GeometryNodesPanel modelPath={show3DViewer?.modelPath ?? null} />
        </div>
      ) : (
        <>
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
                      garmentColorHex={show3DViewer.garmentColorHex}
                      onUVBoundsDetected={show3DViewer.onUVBoundsDetected}
                      onMeshInfoDetected={show3DViewer.onMeshInfoDetected}
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
        </>
      )}
    </main>
  );
});
