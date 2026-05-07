"use client";

import type { CanvasElement } from "@/types";
import { Box, Boxes } from "lucide-react";
import { forwardRef } from "react";
import { TextureNodesPanel } from "./TextureNodesPanel";

export const CANVAS_DROPPABLE_ID = "canvas-drop-zone";
/** ID del drop zone del editor 2D en el panel derecho (misma lógica de posición). */
export const CANVAS_DROPPABLE_ID_2D = "canvas-drop-zone-2d";

/** Logical design size used for element positions (matches render-design-to-texture). */
export const LOGICAL_WIDTH = 400;
export const LOGICAL_HEIGHT = 300;

export type CenterViewMode = "preview" | "nodes";

export interface EditorCanvasAreaProps {
  /** Conservados por compatibilidad con el layout; el área central es solo vista previa / nodos. */
  elements: CanvasElement[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onClearSelection: () => void;
  centerViewMode?: CenterViewMode;
  onCenterViewModeChange?: (mode: CenterViewMode) => void;
  texturePreview?: {
    textureUrl: string | null;
    garmentColorHex?: string;
    onMaterialColorChange?: (hex: string) => void;
    onMaterialTextureChange?: (url: string | null) => void;
  } | null;
}

function FlatTexturePreview({
  textureUrl,
  garmentColorHex,
}: {
  textureUrl: string | null;
  garmentColorHex?: string;
}) {
  const bg = garmentColorHex ?? "#fafafa";
  return (
    <div
      className="flex size-full min-h-[320px] items-center justify-center rounded-xl border border-border/80 p-6"
      style={{ backgroundColor: bg }}
    >
      {textureUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URLs and blob URLs from texture pipeline
        <img
          src={textureUrl}
          alt=""
          className="max-h-[min(520px,70vh)] max-w-full object-contain shadow-md"
        />
      ) : (
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Añade elementos al diseño o sube una textura base en Prendas para ver
          la vista previa.
        </p>
      )}
    </div>
  );
}

export const EditorCanvasArea = forwardRef<
  HTMLDivElement,
  EditorCanvasAreaProps
>(function EditorCanvasArea(
  {
    elements: _elements,
    selectedId: _selectedId,
    onSelectElement: _onSelectElement,
    onClearSelection: _onClearSelection,
    centerViewMode = "preview",
    onCenterViewModeChange,
    texturePreview = null,
  },
  ref,
) {
  return (
    <main
      ref={ref}
      className="editor-canvas-grid relative flex flex-1 min-w-0 flex-col overflow-hidden border-r border-border"
      aria-label={
        centerViewMode === "nodes"
          ? "Nodos de textura"
          : "Vista previa del diseño"
      }
    >
      {onCenterViewModeChange && (
        <div
          className="flex shrink-0 border-b border-border bg-muted/30 px-2 py-1"
          role="tablist"
          aria-label="Vista central"
        >
          <button
            type="button"
            role="tab"
            aria-selected={centerViewMode === "preview" ? "true" : "false"}
            onClick={() => onCenterViewModeChange("preview")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              centerViewMode === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Box className="size-4" />
            Vista previa
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
            fullView
            garmentColor={texturePreview?.garmentColorHex ?? "#ffffff"}
            onMaterialColorChange={texturePreview?.onMaterialColorChange}
            onMaterialTextureChange={texturePreview?.onMaterialTextureChange}
          />
        </div>
      ) : (
        <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-auto p-4">
          <FlatTexturePreview
            textureUrl={texturePreview?.textureUrl ?? null}
            garmentColorHex={texturePreview?.garmentColorHex}
          />
        </div>
      )}
    </main>
  );
});
