"use client";

import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CanvasElement } from "@/types";
import type { PathPoint } from "@/types";
import type { Mockup } from "@/types";
import { CanvasDropZone } from "./canvas-drop-zone";
import { CanvasElementNodes } from "./canvas-element-nodes";
import { CANVAS_DROPPABLE_ID_2D } from "./EditorCanvasArea";
import { LayersPanel } from "./layers-panel";
import { MockupPanel } from "./mockup-panel";
import type { CanvasElementPatch } from "./properties-panel";
import { PropertiesPanel } from "./properties-panel";

export type EditorPanelTab = "design" | "nodes";

export interface EditorRightPanelProps {
  selectedId: string | null;
  elements: CanvasElement[];
  onSelectElement: (id: string) => void;
  onMoveLayer: (id: string, direction: import("./layers-panel").LayerMoveDirection) => void;
  onUpdateElement: (id: string, partial: CanvasElementPatch) => void;
  onClearSelection: () => void;
  projectName?: string;
  selectedMockup?: Mockup | null;
  onSelectMockup?: (mockup: Mockup | null) => void;
  onTexture3dChange?: (url: string | null) => void;
  garmentColor?: string;
  onGarmentColorChange?: (hex: string) => void;
  /** Used for ZIP export: captura del bitmap del canvas cuando exista */
  getCanvasAsBlob?: () => Promise<Blob | null>;
  /** Current texture with design (for export) */
  getEffectiveTextureBlob?: () => Promise<Blob | null>;
  /** Export design as JSON (canvas elements + metadata) for portability */
  onExportDesignJson?: () => void;
  /** Cuando el pincel está activo, dibujar en el canvas 2D termina un trazo */
  activeTool?: string;
  onPathStrokeComplete?: (points: PathPoint[], strokeColor?: string, strokeWidth?: number) => void;
  /** Tab activo: diseño 2D o lista */
  rightPanelTab?: EditorPanelTab;
  onRightPanelTabChange?: (tab: EditorPanelTab) => void;
  /** Mockups (base_models) from DB for Prendas panel */
  mockups?: Mockup[];
  /** Tras insertar texto, llevar scroll y foco al campo de edición */
  pendingFocusTextId?: string | null;
  onFocusTextDone?: () => void;
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  onAdd,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border/80 last:border-b-0">
      <div className="flex items-center justify-between gap-1 py-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-2 text-left text-sm font-medium text-foreground transition-colors hover:text-foreground/90"
        >
          {open ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span>{title}</span>
        </button>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Añadir ${title}`}
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>
      {open && <div className="pb-5">{children}</div>}
    </section>
  );
}

export function EditorRightPanel({
  selectedId,
  elements,
  onSelectElement,
  onMoveLayer,
  onUpdateElement,
  onClearSelection,
  projectName = "proyecto",
  selectedMockup = null,
  onSelectMockup,
  onTexture3dChange,
  garmentColor = "#ffffff",
  onGarmentColorChange,
  getCanvasAsBlob,
  getEffectiveTextureBlob,
  onExportDesignJson,
  activeTool = "move",
  onPathStrokeComplete,
  rightPanelTab = "design",
  onRightPanelTabChange,
  mockups = [],
  pendingFocusTextId = null,
  onFocusTextDone,
}: EditorRightPanelProps) {
  const designSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedId) return;
    designSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  useEffect(() => {
    if (pendingFocusTextId) setElementosOpen(true);
  }, [pendingFocusTextId]);

  const handleFocusTextDone = () => {
    onFocusTextDone?.();
  };
  const [prendasOpen, setPrendasOpen] = useState(true);
  const [editor2DOpen, setEditor2DOpen] = useState(true);
  const [elementosOpen, setElementosOpen] = useState(true);
  const [drawingPoints, setDrawingPoints] = useState<PathPoint[] | null>(null);
  const canvas2DRef = useRef<HTMLDivElement>(null);
  const hasSelection = selectedId != null;

  const getLogicalCoords = (e: React.PointerEvent) => {
    const el = canvas2DRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 400;
    const y = ((e.clientY - rect.top) / rect.height) * 300;
    return { x: Math.max(0, Math.min(400, x)), y: Math.max(0, Math.min(300, y)) };
  };

  const handleBrushPointerDown = (e: React.PointerEvent) => {
    if (activeTool !== "tool-brush" || !onPathStrokeComplete) return;
    e.preventDefault();
    const { x, y } = getLogicalCoords(e);
    setDrawingPoints([[x, y]]);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleBrushPointerMove = (e: React.PointerEvent) => {
    if (activeTool !== "tool-brush" || !drawingPoints) return;
    e.preventDefault();
    const { x, y } = getLogicalCoords(e);
    setDrawingPoints((prev) => (prev ? [...prev, [x, y]] : null));
  };

  const handleBrushPointerUp = (e: React.PointerEvent) => {
    if (activeTool !== "tool-brush") return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    if (drawingPoints && drawingPoints.length >= 2 && onPathStrokeComplete) {
      onPathStrokeComplete(drawingPoints);
    }
    setDrawingPoints(null);
  };

  return (
    <aside
      className="editor-panel scrollbar-hide flex w-80 shrink-0 flex-col overflow-y-auto border-l border-border px-5 py-4"
      aria-label="Prendas y elementos"
    >
      <CollapsibleSection title="Prendas" open={prendasOpen} onToggle={() => setPrendasOpen(!prendasOpen)}>
        <MockupPanel
          mockups={mockups}
          elements={elements}
          projectName={projectName}
          selectedMockup={selectedMockup}
          onSelectMockup={onSelectMockup}
          onTexture3dChange={onTexture3dChange}
          garmentColor={garmentColor}
          onGarmentColorChange={onGarmentColorChange}
          getCanvasAsBlob={getCanvasAsBlob}
          getEffectiveTextureBlob={getEffectiveTextureBlob}
          onExportDesignJson={onExportDesignJson}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Diseño en el lienzo"
        open={editor2DOpen}
        onToggle={() => setEditor2DOpen(!editor2DOpen)}
      >
        <p className="mb-2 text-xs text-muted-foreground">
          {activeTool === "tool-brush"
            ? "Pincel activo: dibuja en el recuadro. El trazo se incluye en la textura de vista previa."
            : "Añade texto, imagen o forma; edita el texto y mueve los elementos en el recuadro."}
        </p>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted/20">
          <div
            ref={canvas2DRef}
            className="origin-top-left relative"
            style={{ width: 400, height: 300, transform: "scale(0.8)" }}
          >
            <CanvasDropZone id={CANVAS_DROPPABLE_ID_2D} onBackgroundClick={onClearSelection} compact>
              <CanvasElementNodes
                elements={elements}
                selectedId={selectedId}
                onSelectElement={onSelectElement}
              />
            </CanvasDropZone>
            {activeTool === "tool-brush" && (
              <div
                className="absolute inset-0 z-10 cursor-crosshair"
                style={{ width: 400, height: 300 }}
                onPointerDown={handleBrushPointerDown}
                onPointerMove={handleBrushPointerMove}
                onPointerUp={handleBrushPointerUp}
                onPointerLeave={() => {
                  if (drawingPoints && drawingPoints.length >= 2 && onPathStrokeComplete) {
                    onPathStrokeComplete(drawingPoints);
                  }
                  setDrawingPoints(null);
                }}
                aria-label="Zona de dibujo con pincel"
              />
            )}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Elementos"
        open={elementosOpen}
        onToggle={() => setElementosOpen(!elementosOpen)}
        onAdd={() => {}}
      >
        <div ref={designSectionRef} className="flex flex-col gap-5">
          <div>
            <h3 className="editor-section-title mb-2.5">Propiedades</h3>
            <PropertiesPanel
              elements={elements}
              selectedId={selectedId}
              onUpdateElement={onUpdateElement}
              focusTextId={pendingFocusTextId ?? undefined}
              onFocusTextDone={handleFocusTextDone}
            />
            {hasSelection && (
              <button
                type="button"
                className="mt-2.5 rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={onClearSelection}
              >
                Deseleccionar
              </button>
            )}
          </div>
          <div>
            <h3 className="editor-section-title mb-2.5">Capas</h3>
            <LayersPanel
              elements={elements}
              selectedId={selectedId}
              onSelectElement={onSelectElement}
              onMoveLayer={onMoveLayer}
              onUpdateElement={onUpdateElement}
            />
          </div>
        </div>
      </CollapsibleSection>

      <div className="mt-4">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 hover:border-primary/60"
        >
          Explorar
          <ChevronRight className="size-4" />
        </button>
      </div>
    </aside>
  );
}
