"use client";

import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import type { CanvasElement } from "@/types";
import { MOCK_MOCKUPS } from "@/config/mock-data";
import { CanvasDropZone } from "./canvas-drop-zone";
import { CanvasElementNodes } from "./canvas-element-nodes";
import { CANVAS_DROPPABLE_ID_2D } from "./EditorCanvasArea";
import { LayersPanel } from "./layers-panel";
import { MockupPanel } from "./mockup-panel";
import type { CanvasElementPatch } from "./properties-panel";
import { PropertiesPanel } from "./properties-panel";

export interface EditorRightPanelProps {
  selectedId: string | null;
  elements: CanvasElement[];
  onSelectElement: (id: string) => void;
  onMoveLayer: (id: string, direction: "up" | "down") => void;
  onUpdateElement: (id: string, partial: CanvasElementPatch) => void;
  onClearSelection: () => void;
  projectName?: string;
  selected3DMockup?: { modelPath: string } | null;
  onSelect3DMockup?: (mockup: { modelPath: string } | null) => void;
  texture3dUrl?: string | null;
  onTexture3dChange?: (url: string | null) => void;
  garmentColor?: string;
  onGarmentColorChange?: (hex: string) => void;
  rotation3d?: number;
  zoom3d?: number;
  onRotation3dChange?: (v: number) => void;
  onZoom3dChange?: (v: number) => void;
  /** Used for ZIP export: capture current 3D canvas as image */
  getCanvasAsBlob?: () => Promise<Blob | null>;
  /** Current texture with design in correct UV zone (for export) */
  getEffectiveTextureBlob?: () => Promise<Blob | null>;
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
  selected3DMockup = null,
  onSelect3DMockup,
  texture3dUrl = null,
  onTexture3dChange,
  garmentColor = "#ffffff",
  onGarmentColorChange,
  rotation3d = 0,
  zoom3d = 1,
  onRotation3dChange,
  onZoom3dChange,
  getCanvasAsBlob,
  getEffectiveTextureBlob,
}: EditorRightPanelProps) {
  const [prendasOpen, setPrendasOpen] = useState(true);
  const [editor2DOpen, setEditor2DOpen] = useState(true);
  const [elementosOpen, setElementosOpen] = useState(true);
  const hasSelection = selectedId != null;

  return (
    <aside
      className="editor-panel flex w-80 shrink-0 flex-col overflow-auto border-l border-border px-5 py-4"
      aria-label="Prendas y elementos"
    >
      <CollapsibleSection
        title="Prendas"
        open={prendasOpen}
        onToggle={() => setPrendasOpen(!prendasOpen)}
      >
        <MockupPanel
          mockups={MOCK_MOCKUPS}
          elements={elements}
          projectName={projectName}
          selected3DMockup={selected3DMockup}
          onSelect3DMockup={onSelect3DMockup}
          texture3dUrl={texture3dUrl}
          onTexture3dChange={onTexture3dChange}
          garmentColor={garmentColor}
          onGarmentColorChange={onGarmentColorChange}
          rotation3d={rotation3d}
          zoom3d={zoom3d}
          onRotation3dChange={onRotation3dChange}
          onZoom3dChange={onZoom3dChange}
          getCanvasAsBlob={getCanvasAsBlob}
          getEffectiveTextureBlob={getEffectiveTextureBlob}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Editor 2D"
        open={editor2DOpen}
        onToggle={() => setEditor2DOpen(!editor2DOpen)}
      >
        <p className="mb-2 text-xs text-muted-foreground">
          Arrastra texto, imagen o forma desde la barra izquierda. Mueve con el asa.
        </p>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted/20">
          <div
            className="origin-top-left"
            style={{ width: 400, height: 300, transform: "scale(0.8)" }}
          >
            <CanvasDropZone
              id={CANVAS_DROPPABLE_ID_2D}
              onBackgroundClick={onClearSelection}
              compact
            >
              <CanvasElementNodes
                elements={elements}
                selectedId={selectedId}
                onSelectElement={onSelectElement}
              />
            </CanvasDropZone>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Elementos"
        open={elementosOpen}
        onToggle={() => setElementosOpen(!elementosOpen)}
        onAdd={() => {}}
      >
        <div className="flex flex-col gap-5">
          <div>
            <h3 className="editor-section-title mb-2.5">Propiedades</h3>
            <PropertiesPanel
              elements={elements}
              selectedId={selectedId}
              onUpdateElement={onUpdateElement}
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
