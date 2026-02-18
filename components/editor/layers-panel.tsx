"use client";

import type { CanvasElement } from "@/types";
import type { CanvasElementPatch } from "./properties-panel";

const TYPE_LABELS: Record<CanvasElement["type"], string> = {
  text: "Texto",
  image: "Imagen",
  shape: "Forma",
  path: "Pincel",
};

function shortId(id: string): string {
  return id.slice(0, 6);
}

export interface LayersPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onMoveLayer: (id: string, direction: "up" | "down") => void;
  onUpdateElement: (id: string, partial: CanvasElementPatch) => void;
}

/**
 * Lista de capas en orden z: el último del array = encima (primero en la lista).
 * Abajo en la lista = atrás en el canvas.
 */
function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-4.363" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

export function LayersPanel({
  elements,
  selectedId,
  onSelectElement,
  onMoveLayer,
  onUpdateElement,
}: LayersPanelProps) {
  const layers = [...elements].reverse();

  if (elements.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        No hay elementos. Arrastra desde el panel izquierdo al canvas.
      </p>
    );
  }

  const btnIconCn =
    "shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none";

  return (
    <ul className="mt-2 space-y-0.5" role="list" aria-label="Capas">
      {layers.map((el) => {
        const isSelected = el.id === selectedId;
        const isVisible = el.visible !== false;
        const index = elements.findIndex((e) => e.id === el.id);
        const canMoveUp = index >= 0 && index < elements.length - 1;
        const canMoveDown = index > 0;
        const label = `${TYPE_LABELS[el.type]} · ${shortId(el.id)}`;
        return (
          <li key={el.id} className="flex items-center gap-1">
            <button
              type="button"
              aria-label={isVisible ? "Ocultar capa" : "Mostrar capa"}
              title={isVisible ? "Ocultar" : "Mostrar"}
              className={btnIconCn}
              onClick={(e) => {
                e.stopPropagation();
                onUpdateElement(el.id, { visible: !isVisible });
              }}
            >
              {isVisible ? (
                <EyeIcon />
              ) : (
                <EyeOffIcon className="text-muted-foreground opacity-60" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onSelectElement(el.id)}
              className={`min-w-0 flex-1 rounded border px-2 py-1.5 text-left text-sm transition-colors ${
                isSelected
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-background hover:bg-muted/50 text-foreground"
              }`}
              aria-pressed={isSelected}
              aria-label={`Capa ${label}, ${isSelected ? "seleccionada" : "seleccionar"}`}
            >
              {label}
            </button>
            <button
              type="button"
              aria-label="Subir capa"
              title="Subir"
              className={btnIconCn}
              disabled={!canMoveUp}
              onClick={(e) => {
                e.stopPropagation();
                onMoveLayer(el.id, "up");
              }}
            >
              <ArrowUpIcon />
            </button>
            <button
              type="button"
              aria-label="Bajar capa"
              title="Bajar"
              className={btnIconCn}
              disabled={!canMoveDown}
              onClick={(e) => {
                e.stopPropagation();
                onMoveLayer(el.id, "down");
              }}
            >
              <ArrowDownIcon />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
