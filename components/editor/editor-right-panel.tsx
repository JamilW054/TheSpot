"use client";

import { useState } from "react";
import type { CanvasElement } from "@/types";
import { MOCK_MOCKUPS } from "@/config/mock-data";
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
}

/**
 * Panel derecho del editor: propiedades del elemento seleccionado y lista de capas.
 */
type RightPanelTab = "properties" | "mockups";

export function EditorRightPanel({
  selectedId,
  elements,
  onSelectElement,
  onMoveLayer,
  onUpdateElement,
  onClearSelection,
}: EditorRightPanelProps) {
  const [activeTab, setActiveTab] = useState<RightPanelTab>("properties");
  const hasSelection = selectedId != null;

  return (
    <aside
      className="flex w-72 shrink-0 flex-col border-l border-border bg-muted/30 p-3"
      aria-label="Propiedades, capas y mockups"
    >
      <div className="flex gap-1 border-b border-border pb-2" role="tablist" aria-label="Secciones del panel">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "properties"}
          aria-controls="right-panel-properties"
          id="tab-properties"
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            activeTab === "properties"
              ? "bg-primary/15 text-foreground"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
          onClick={() => setActiveTab("properties")}
        >
          Propiedades
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "mockups"}
          aria-controls="right-panel-mockups"
          id="tab-mockups"
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            activeTab === "mockups"
              ? "bg-primary/15 text-foreground"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
          onClick={() => setActiveTab("mockups")}
        >
          Mockups
        </button>
      </div>

      {activeTab === "properties" && (
        <div id="right-panel-properties" role="tabpanel" aria-labelledby="tab-properties" className="flex flex-1 min-h-0 flex-col overflow-auto">
          <h2 className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Propiedades
          </h2>
          <PropertiesPanel
            elements={elements}
            selectedId={selectedId}
            onUpdateElement={onUpdateElement}
          />
          {hasSelection && (
            <button
              type="button"
              className="mt-3 rounded border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
              onClick={onClearSelection}
            >
              Deseleccionar
            </button>
          )}
          <h2 className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Capas
          </h2>
          <LayersPanel
            elements={elements}
            selectedId={selectedId}
            onSelectElement={onSelectElement}
            onMoveLayer={onMoveLayer}
            onUpdateElement={onUpdateElement}
          />
        </div>
      )}

      {activeTab === "mockups" && (
        <div id="right-panel-mockups" role="tabpanel" aria-labelledby="tab-mockups" className="flex flex-1 min-h-0 flex-col overflow-auto">
          <h2 className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Mockups
          </h2>
          <MockupPanel mockups={MOCK_MOCKUPS} />
        </div>
      )}
    </aside>
  );
}
