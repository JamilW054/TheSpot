"use client";

import type { CanvasElement } from "@/types";
import type { CanvasElementPatch } from "./properties-panel";
import { PropertiesPanel } from "./properties-panel";

export interface EditorRightPanelProps {
  selectedId: string | null;
  elements: CanvasElement[];
  onUpdateElement: (id: string, partial: CanvasElementPatch) => void;
  onClearSelection: () => void;
}

/**
 * Panel derecho del editor: propiedades del elemento seleccionado y lista de capas.
 */
export function EditorRightPanel({
  selectedId,
  elements,
  onUpdateElement,
  onClearSelection,
}: EditorRightPanelProps) {
  const hasSelection = selectedId != null;

  return (
    <aside
      className="flex w-72 shrink-0 flex-col border-l border-border bg-muted/30 p-3"
      aria-label="Propiedades y capas"
    >
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
      <p className="mt-2 text-sm text-muted-foreground">
        (Placeholder: lista de capas / orden z)
      </p>
    </aside>
  );
}
