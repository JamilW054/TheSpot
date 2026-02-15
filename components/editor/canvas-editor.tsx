"use client";

import type { CanvasElement } from "@/types";
import dynamic from "next/dynamic";
import { CanvasDropZone } from "./canvas-drop-zone";
import { CanvasElementNodes } from "./canvas-element-nodes";

const MockupViewer3D = dynamic(() => import("./MockupViewer3D").then((m) => ({ default: m.MockupViewer3D })), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[500px] w-full flex-col items-center justify-center gap-2 bg-neutral-900 text-muted-foreground">
      <span>Cargando modelo 3D…</span>
      <span className="text-xs">Puede tardar unos segundos</span>
    </div>
  ),
});

export const CANVAS_DROPPABLE_ID = "canvas-drop-zone";

export interface CanvasEditorProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onClearSelection: () => void;
  /** Cuando se selecciona un mockup 3D, muestra el visor en grande en el centro */
  show3DViewer?: {
    modelPath: string;
    textureUrl: string | null;
    rotation?: number;
    zoom?: number;
  } | null;
}

export function CanvasEditor({
  elements,
  selectedId,
  onSelectElement,
  onClearSelection,
  show3DViewer = null,
}: CanvasEditorProps) {
  if (show3DViewer) {
    return (
      <div
        className="relative flex flex-1 min-w-0 flex-col items-center justify-center border border-border bg-neutral-900 p-4"
        aria-label="Vista previa 3D"
      >
        <div className="h-[500px] w-full max-w-3xl overflow-hidden rounded-lg border border-border">
          <MockupViewer3D
            modelPath={show3DViewer.modelPath}
            textureUrl={show3DViewer.textureUrl}
            fullSize
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-1 min-w-0 flex-col border border-dashed border-border bg-muted/20"
      aria-label="Área de diseño"
    >
      <CanvasDropZone id={CANVAS_DROPPABLE_ID} onBackgroundClick={onClearSelection}>
        <CanvasElementNodes
          elements={elements}
          selectedId={selectedId}
          onSelectElement={onSelectElement}
        />
      </CanvasDropZone>
    </div>
  );
}
