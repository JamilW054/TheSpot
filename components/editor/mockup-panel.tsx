"use client";

import { useState } from "react";
import type { CanvasElement, Mockup } from "@/types";

const ROTATION_STEP = 15;
const ZOOM_STEP = 0.25;
const MIN_SCALE = 0.25;
const MAX_SCALE = 2;

/** Logical canvas size used for mapping element coords to design zone. */
const CANVAS_LOGICAL_WIDTH = 400;
const CANVAS_LOGICAL_HEIGHT = 300;
const DESIGN_ZONE_WIDTH = 160;
const DESIGN_ZONE_HEIGHT = 120;

export interface MockupPanelProps {
  mockups: Mockup[];
  elements: CanvasElement[];
}

function ImagePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function DesignZoneContent({
  elements,
  scaleX,
  scaleY,
}: {
  elements: CanvasElement[];
  scaleX: number;
  scaleY: number;
}) {
  return (
    <>
      {elements.map((el) => {
        if (el.visible === false) return null;
        return (
          <div
            key={el.id}
            className="absolute flex overflow-hidden rounded border border-border bg-background text-foreground"
            style={{
              left: el.x * scaleX,
              top: el.y * scaleY,
              width: el.width * scaleX,
              height: el.height * scaleY,
            }}
          >
            {el.type === "text" ? (
              <span className="flex min-h-0 min-w-0 flex-1 items-center px-1 py-0.5 wrap-break-word text-[10px] leading-tight">
                {el.content != null && el.content !== "" ? (
                  el.content
                ) : (
                  <span className="text-muted-foreground">Texto</span>
                )}
              </span>
            ) : el.type === "shape" ? (
              <div
                className={`h-full w-full border border-primary bg-primary/20 ${el.content === "circle" ? "rounded-full" : "rounded"}`}
              />
            ) : el.type === "image" ? (
              el.content ? (
                <img
                  src={el.content}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <ImagePlaceholderIcon className="text-muted-foreground" />
                </div>
              )
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export function MockupPanel({ mockups, elements }: MockupPanelProps) {
  const [selectedMockupId, setSelectedMockupId] = useState<string | null>(null);
  const [rotationY, setRotationY] = useState(0);
  const [scale, setScale] = useState(1);

  const selectedMockup = selectedMockupId != null
    ? mockups.find((m) => m.id === selectedMockupId)
    : null;

  const handleRotate = () => setRotationY((prev) => prev + ROTATION_STEP);
  const handleZoomIn = () => setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_SCALE));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_SCALE));
  const handleReset = () => {
    setRotationY(0);
    setScale(1);
  };

  if (mockups.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        No hay mockups configurados.
      </p>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-3">
      <ul className="grid gap-1.5" role="list" aria-label="Lista de mockups">
        {mockups.map((mockup) => {
          const isSelected = mockup.id === selectedMockupId;
          return (
            <li key={mockup.id}>
              <button
                type="button"
                onClick={() => setSelectedMockupId(mockup.id)}
                className={`w-full rounded border px-2 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-background hover:bg-muted/50 text-foreground"
                }`}
                aria-pressed={isSelected}
              >
                <span className="font-medium">{mockup.name}</span>
                <span className="ml-1.5 text-muted-foreground text-xs uppercase">
                  {mockup.category}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <section aria-label="Vista previa del mockup" className="flex flex-col gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Vista previa
        </h3>
        {selectedMockup != null ? (
          <>
            <div
              className="rounded border border-border bg-muted/20 overflow-hidden min-h-[140px] flex items-center justify-center"
              style={{ perspective: "400px" }}
            >
              <div
                className="flex items-center justify-center origin-center relative"
                style={{
                  transform: `rotateY(${rotationY}deg) scale(${scale})`,
                  transformStyle: "preserve-3d",
                }}
              >
                {selectedMockup.imageUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={selectedMockup.imageUrl}
                      alt={selectedMockup.name}
                      className="max-h-48 w-auto max-w-full object-contain select-none block"
                      draggable={false}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      aria-hidden
                    >
                      <div
                        className="relative overflow-hidden bg-transparent rounded"
                        style={{
                          width: DESIGN_ZONE_WIDTH,
                          height: DESIGN_ZONE_HEIGHT,
                        }}
                      >
                        <DesignZoneContent
                          elements={elements}
                          scaleX={DESIGN_ZONE_WIDTH / CANVAS_LOGICAL_WIDTH}
                          scaleY={DESIGN_ZONE_HEIGHT / CANVAS_LOGICAL_HEIGHT}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 p-4 text-muted-foreground text-sm">
                    <span>{selectedMockup.name}</span>
                    <span className="text-xs">Sin imagen</span>
                    {elements.length > 0 && (
                      <div
                        className="relative mt-2 overflow-hidden rounded border border-border bg-background/80"
                        style={{
                          width: DESIGN_ZONE_WIDTH,
                          height: DESIGN_ZONE_HEIGHT,
                        }}
                      >
                        <DesignZoneContent
                          elements={elements}
                          scaleX={DESIGN_ZONE_WIDTH / CANVAS_LOGICAL_WIDTH}
                          scaleY={DESIGN_ZONE_HEIGHT / CANVAS_LOGICAL_HEIGHT}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2" role="group" aria-label="Controles de vista previa">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
                  aria-label="Menos zoom"
                  title="Menos zoom"
                  onClick={handleZoomOut}
                >
                  −
                </button>
                <button
                  type="button"
                  className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
                  aria-label="Más zoom"
                  title="Más zoom"
                  onClick={handleZoomIn}
                >
                  +
                </button>
                <span className="text-muted-foreground text-xs px-1" aria-hidden>
                  Zoom
                </span>
                <button
                  type="button"
                  className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
                  title="Rotar"
                  onClick={handleRotate}
                >
                  Rotar
                </button>
                <button
                  type="button"
                  className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
                  title="Restablecer vista"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center text-xs">
                <label htmlFor="mockup-rotation" className="text-muted-foreground">
                  Rotación
                </label>
                <input
                  id="mockup-rotation"
                  type="range"
                  min={0}
                  max={360}
                  step={5}
                  value={((rotationY % 360) + 360) % 360}
                  onChange={(e) => setRotationY(Number(e.target.value))}
                  className="w-full accent-primary"
                  aria-valuemin={0}
                  aria-valuemax={360}
                  aria-valuenow={((rotationY % 360) + 360) % 360}
                />
                <label htmlFor="mockup-zoom" className="text-muted-foreground">
                  Zoom
                </label>
                <input
                  id="mockup-zoom"
                  type="range"
                  min={MIN_SCALE * 100}
                  max={MAX_SCALE * 100}
                  step={ZOOM_STEP * 100}
                  value={scale * 100}
                  onChange={(e) => setScale(Number(e.target.value) / 100)}
                  className="w-full accent-primary"
                  aria-valuemin={MIN_SCALE * 100}
                  aria-valuemax={MAX_SCALE * 100}
                  aria-valuenow={scale * 100}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="rounded border border-dashed border-border bg-muted/10 flex min-h-[120px] items-center justify-center text-muted-foreground text-sm">
            Selecciona un mockup para ver la vista previa
          </div>
        )}
      </section>
    </div>
  );
}
