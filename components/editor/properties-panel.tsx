"use client";

import type { CanvasElement } from "@/types";

export type CanvasElementPatch = Partial<
  Pick<CanvasElement, "x" | "y" | "width" | "height" | "content" | "visible">
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

  const STEP_POS = 1;
  const STEP_SIZE = 10;

  const handleX = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const safe = Number.isNaN(value) ? 0 : clampNum(value, 0, 10000);
    onUpdateElement(element.id, { x: safe });
  };
  const handleY = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const safe = Number.isNaN(value) ? 0 : clampNum(value, 0, 10000);
    onUpdateElement(element.id, { y: safe });
  };
  const handleWidth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const safe = Number.isNaN(value) || value < 1 ? 1 : clampNum(value, 1, 2000);
    onUpdateElement(element.id, { width: safe });
  };
  const handleHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const safe = Number.isNaN(value) || value < 1 ? 1 : clampNum(value, 1, 2000);
    onUpdateElement(element.id, { height: safe });
  };

  const stepX = (delta: number) =>
    onUpdateElement(element.id, { x: clampNum(element.x + delta, 0, 10000) });
  const stepY = (delta: number) =>
    onUpdateElement(element.id, { y: clampNum(element.y + delta, 0, 10000) });
  const stepWidth = (delta: number) =>
    onUpdateElement(element.id, {
      width: clampNum(element.width + delta, 1, 2000),
    });
  const stepHeight = (delta: number) =>
    onUpdateElement(element.id, {
      height: clampNum(element.height + delta, 1, 2000),
    });
  const handleContent = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdateElement(element.id, { content: e.target.value });
  };

  const inputCn =
    "rounded border border-border bg-background px-2 py-1 text-foreground w-full min-w-0";
  const btnCn =
    "shrink-0 rounded border border-border bg-muted/50 hover:bg-muted text-foreground w-7 h-7 flex items-center justify-center text-sm font-medium";

  return (
    <div className="mt-2 space-y-3 text-sm">
      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center">
        <label htmlFor="prop-x" className="text-muted-foreground">
          Posición X (px)
        </label>
        <div className="flex gap-1 items-center">
          <input
            id="prop-x"
            type="number"
            min={0}
            step={STEP_POS}
            value={element.x}
            onChange={handleX}
            className={inputCn}
          />
          <button
            type="button"
            aria-label="Decrementar X"
            className={btnCn}
            onClick={() => stepX(-STEP_POS)}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Incrementar X"
            className={btnCn}
            onClick={() => stepX(STEP_POS)}
          >
            +
          </button>
        </div>
        <label htmlFor="prop-y" className="text-muted-foreground">
          Posición Y (px)
        </label>
        <div className="flex gap-1 items-center">
          <input
            id="prop-y"
            type="number"
            min={0}
            step={STEP_POS}
            value={element.y}
            onChange={handleY}
            className={inputCn}
          />
          <button
            type="button"
            aria-label="Decrementar Y"
            className={btnCn}
            onClick={() => stepY(-STEP_POS)}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Incrementar Y"
            className={btnCn}
            onClick={() => stepY(STEP_POS)}
          >
            +
          </button>
        </div>
        <label htmlFor="prop-width" className="text-muted-foreground">
          Ancho (px)
        </label>
        <div className="flex gap-1 items-center">
          <input
            id="prop-width"
            type="number"
            min={1}
            step={STEP_SIZE}
            value={element.width}
            onChange={handleWidth}
            className={inputCn}
          />
          <button
            type="button"
            aria-label="Decrementar ancho"
            className={btnCn}
            onClick={() => stepWidth(-STEP_SIZE)}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Incrementar ancho"
            className={btnCn}
            onClick={() => stepWidth(STEP_SIZE)}
          >
            +
          </button>
        </div>
        <label htmlFor="prop-height" className="text-muted-foreground">
          Alto (px)
        </label>
        <div className="flex gap-1 items-center">
          <input
            id="prop-height"
            type="number"
            min={1}
            step={STEP_SIZE}
            value={element.height}
            onChange={handleHeight}
            className={inputCn}
          />
          <button
            type="button"
            aria-label="Decrementar alto"
            className={btnCn}
            onClick={() => stepHeight(-STEP_SIZE)}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Incrementar alto"
            className={btnCn}
            onClick={() => stepHeight(STEP_SIZE)}
          >
            +
          </button>
        </div>
      </div>
      {element.type === "text" && (
        <div className="space-y-1">
          <label htmlFor="prop-content" className="text-muted-foreground block">
            Texto
          </label>
          <textarea
            id="prop-content"
            rows={3}
            value={element.content ?? ""}
            onChange={handleContent}
            placeholder="Texto"
            className="rounded border border-border bg-background px-2 py-1 text-foreground w-full resize-y min-h-16"
          />
        </div>
      )}
    </div>
  );
}
