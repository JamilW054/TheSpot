"use client";

import type { CanvasElement } from "@/types";

export interface EditorRightPanelProps {
  selectedId: string | null;
  elements: CanvasElement[];
  onClearSelection: () => void;
}

/**
 * Panel derecho del editor: propiedades del elemento seleccionado y lista de capas.
 * Muestra inputs del elemento seleccionado cuando hay uno; si no, placeholder.
 */
export function EditorRightPanel({
  selectedId,
  elements,
  onClearSelection,
}: EditorRightPanelProps) {
  const selectedElement = selectedId
    ? elements.find((el) => el.id === selectedId)
    : null;

  return (
    <aside
      className="flex w-72 shrink-0 flex-col border-l border-border bg-muted/30 p-3"
      aria-label="Propiedades y capas"
    >
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Propiedades
      </h2>
      {selectedElement ? (
        <div className="mt-2 space-y-2 text-sm">
          <p className="text-muted-foreground">
            Elemento seleccionado: <strong>{selectedElement.type}</strong> (
            {selectedElement.id.slice(0, 8)}…)
          </p>
          <button
            type="button"
            className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
            onClick={onClearSelection}
          >
            Deseleccionar
          </button>
          {/* Placeholder: inputs de propiedades (x, y, width, height, content, etc.) se añadirán aquí */}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Haz clic en un elemento del canvas para editar sus propiedades.
        </p>
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
