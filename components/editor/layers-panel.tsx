"use client";

import type { CanvasElement } from "@/types";

const TYPE_LABELS: Record<CanvasElement["type"], string> = {
  text: "Texto",
  image: "Imagen",
  shape: "Forma",
};

function shortId(id: string): string {
  return id.slice(0, 6);
}

export interface LayersPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
}

/**
 * Lista de capas en orden z: el último del array = encima (primero en la lista).
 * Abajo en la lista = atrás en el canvas.
 */
export function LayersPanel({
  elements,
  selectedId,
  onSelectElement,
}: LayersPanelProps) {
  const layers = [...elements].reverse();

  if (elements.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        No hay elementos. Arrastra desde el panel izquierdo al canvas.
      </p>
    );
  }

  return (
    <ul className="mt-2 space-y-0.5" role="list" aria-label="Capas">
      {layers.map((el) => {
        const isSelected = el.id === selectedId;
        const label = `${TYPE_LABELS[el.type]} · ${shortId(el.id)}`;
        return (
          <li key={el.id}>
            <button
              type="button"
              onClick={() => onSelectElement(el.id)}
              className={`w-full rounded border px-2 py-1.5 text-left text-sm transition-colors ${
                isSelected
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-background hover:bg-muted/50 text-foreground"
              }`}
              aria-pressed={isSelected}
              aria-label={`Capa ${label}, ${isSelected ? "seleccionada" : "seleccionar"}`}
            >
              {label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
