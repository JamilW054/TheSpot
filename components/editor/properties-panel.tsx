"use client";

import type { CanvasElement } from "@/types";

export type CanvasElementPatch = Partial<
  Pick<CanvasElement, "x" | "y" | "width" | "height" | "content">
>;

export interface PropertiesPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onUpdateElement: (id: string, partial: CanvasElementPatch) => void;
}

function clampNum(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function PropertiesPanel({
  elements,
  selectedId,
  onUpdateElement,
}: PropertiesPanelProps) {
  const element = selectedId
    ? elements.find((el) => el.id === selectedId)
    : null;

  if (!selectedId || !element) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        Selecciona un elemento del canvas para editar sus propiedades.
      </p>
    );
  }

  const handleX = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value);
    if (!Number.isNaN(value)) {
      onUpdateElement(element.id, { x: clampNum(value, 0, 10000) });
    }
  };
  const handleY = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value);
    if (!Number.isNaN(value)) {
      onUpdateElement(element.id, { y: clampNum(value, 0, 10000) });
    }
  };
  const handleWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value);
    if (!Number.isNaN(value) && value > 0) {
      onUpdateElement(element.id, { width: clampNum(value, 1, 2000) });
    }
  };
  const handleHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value);
    if (!Number.isNaN(value) && value > 0) {
      onUpdateElement(element.id, { height: clampNum(value, 1, 2000) });
    }
  };
  const handleContent = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateElement(element.id, { content: e.target.value });
  };

  return (
    <div className="mt-2 space-y-3 text-sm">
      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center">
        <label htmlFor="prop-x" className="text-muted-foreground">
          X
        </label>
        <input
          id="prop-x"
          type="number"
          min={0}
          step={1}
          value={element.x}
          onChange={handleX}
          className="rounded border border-border bg-background px-2 py-1 text-foreground w-full"
        />
        <label htmlFor="prop-y" className="text-muted-foreground">
          Y
        </label>
        <input
          id="prop-y"
          type="number"
          min={0}
          step={1}
          value={element.y}
          onChange={handleY}
          className="rounded border border-border bg-background px-2 py-1 text-foreground w-full"
        />
        <label htmlFor="prop-width" className="text-muted-foreground">
          Ancho
        </label>
        <input
          id="prop-width"
          type="number"
          min={1}
          step={1}
          value={element.width}
          onChange={handleWidth}
          className="rounded border border-border bg-background px-2 py-1 text-foreground w-full"
        />
        <label htmlFor="prop-height" className="text-muted-foreground">
          Alto
        </label>
        <input
          id="prop-height"
          type="number"
          min={1}
          step={1}
          value={element.height}
          onChange={handleHeight}
          className="rounded border border-border bg-background px-2 py-1 text-foreground w-full"
        />
      </div>
      {element.type === "text" && (
        <div className="space-y-1">
          <label htmlFor="prop-content" className="text-muted-foreground block">
            Texto
          </label>
          <input
            id="prop-content"
            type="text"
            value={element.content ?? ""}
            onChange={handleContent}
            className="rounded border border-border bg-background px-2 py-1 text-foreground w-full"
          />
        </div>
      )}
    </div>
  );
}
