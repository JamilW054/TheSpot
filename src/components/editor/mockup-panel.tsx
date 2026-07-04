"use client";

import { useState } from "react";
import type { CanvasElement, Mockup } from "@/types";
import { GarmentColorPicker } from "./GarmentColorPicker";
import { TextureUploadPanel } from "./TextureUploadPanel";

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
  projectName?: string;
  selectedMockup?: Mockup | null;
  onSelectMockup?: (mockup: Mockup | null) => void;
  onTexture3dChange?: (url: string | null) => void;
  garmentColor?: string;
  onGarmentColorChange?: (hex: string) => void;
  getCanvasAsBlob?: () => Promise<Blob | null>;
  getEffectiveTextureBlob?: () => Promise<Blob | null>;
  onExportDesignJson?: () => void;
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
                  <span className="text-muted-foreground">
                    Escribe tu texto
                  </span>
                )}
              </span>
            ) : el.type === "shape" ? (
              <div
                className={`h-full w-full border border-primary bg-primary/20 ${(el.shapeKind ?? (el.content === "circle" ? "circle" : "rect")) === "circle" ? "rounded-full" : "rounded"}`}
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
            ) : el.type === "path" ? (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                Trazo
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function MockupCardThumb({ mockup }: { mockup: Mockup }) {
  if (mockup.imageUrl) {
    return (
      <img
        src={mockup.imageUrl}
        alt=""
        className="size-full object-cover"
        draggable={false}
      />
    );
  }
  return (
    <div className="flex size-full items-center justify-center bg-muted/60">
      <ImagePlaceholderIcon className="size-8 text-muted-foreground" />
    </div>
  );
}

export function MockupPanel({
  mockups,
  elements,
  projectName = "proyecto",
  selectedMockup = null,
  onSelectMockup,
  onTexture3dChange,
  garmentColor = "#ffffff",
  onGarmentColorChange,
  getCanvasAsBlob,
  getEffectiveTextureBlob,
  onExportDesignJson,
}: MockupPanelProps) {
  const [rotationY, setRotationY] = useState(0);
  const [scale, setScale] = useState(1);

  const handleRotate = () => setRotationY((prev) => prev + ROTATION_STEP);
  const handleZoomIn = () =>
    setScale((prev) => Math.min(prev + ZOOM_STEP, MAX_SCALE));
  const handleZoomOut = () =>
    setScale((prev) => Math.max(prev - ZOOM_STEP, MIN_SCALE));
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
    <div className="mt-1 flex flex-col gap-4">
      <ul
        className="grid grid-cols-2 gap-2.5"
        role="list"
        aria-label="Lista de prendas"
      >
        {mockups.map((mockup) => {
          const isSelected = mockup.id === selectedMockup?.id;
          return (
            <li key={mockup.id}>
              <button
                type="button"
                onClick={() => onSelectMockup?.(mockup)}
                className={`flex w-full flex-col overflow-hidden rounded-xl border text-left transition-all duration-150 ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-border hover:bg-muted/20"
                }`}
                aria-pressed={isSelected ? "true" : "false"}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-xl">
                  <MockupCardThumb mockup={mockup} />
                  <span
                    className="absolute top-1.5 right-1.5 rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur-sm"
                    aria-hidden
                  >
                    {mockup.category}
                  </span>
                </div>
                <span className="truncate px-2.5 py-2 text-xs font-medium text-foreground">
                  {mockup.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <section
        aria-label="Vista previa del mockup"
        className="flex flex-col gap-3"
      >
        <h3 className="editor-section-title">Vista previa</h3>
        {selectedMockup != null ? (
          <>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Así se verán los elementos del canvas sobre la referencia de la
              prenda. La vista grande está en el centro del editor.
            </p>
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
                    <span className="text-xs">Sin imagen de referencia</span>
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
            <div
              className="flex flex-col gap-3"
              role="group"
              aria-label="Controles de vista previa"
            >
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  aria-label="Menos zoom"
                  title="Menos zoom"
                  onClick={handleZoomOut}
                >
                  −
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  aria-label="Más zoom"
                  title="Más zoom"
                  onClick={handleZoomIn}
                >
                  +
                </button>
                <span className="text-muted-foreground text-xs" aria-hidden>
                  Zoom
                </span>
                <button
                  type="button"
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  title="Rotar"
                  onClick={handleRotate}
                >
                  Rotar
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                  title="Restablecer vista"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center text-xs">
                <label
                  htmlFor="mockup-rotation"
                  className="text-muted-foreground min-w-0"
                >
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
                  className="editor-range w-full"
                  aria-valuemin={0}
                  aria-valuemax={360}
                  aria-valuenow={((rotationY % 360) + 360) % 360}
                  aria-valuetext={`${((rotationY % 360) + 360) % 360} grados`}
                />
                <label
                  htmlFor="mockup-zoom"
                  className="text-muted-foreground min-w-0"
                >
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
                  className="editor-range w-full"
                  aria-valuemin={MIN_SCALE * 100}
                  aria-valuemax={MAX_SCALE * 100}
                  aria-valuenow={scale * 100}
                  aria-valuetext={`${Math.round(scale * 100)}%`}
                />
              </div>
            </div>
            <div className="rounded-xl border border-border/80 bg-gradient-to-br from-muted/30 to-muted/10 p-3">
              <label className="mb-2 block text-xs font-medium text-foreground">
                Color de la prenda
              </label>
              <div className="flex items-center gap-3">
                <GarmentColorPicker
                  value={garmentColor}
                  onChange={(hex) => onGarmentColorChange?.(hex)}
                  label="Elegir color de la prenda"
                />
                <input
                  type="text"
                  value={garmentColor}
                  onChange={(e) =>
                    onGarmentColorChange?.(e.target.value.trim() || "#ffffff")
                  }
                  className="h-9 w-24 rounded-lg border border-border bg-background px-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="#ffffff"
                  aria-label="Código hex del color"
                />
              </div>
            </div>
            <TextureUploadPanel
              projectName={projectName}
              onTextureChange={(url) => onTexture3dChange?.(url)}
              getCanvasAsBlob={getCanvasAsBlob}
              getEffectiveTextureBlob={getEffectiveTextureBlob}
              onExportDesignJson={onExportDesignJson}
            />
          </>
        ) : (
          <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 text-center text-sm text-muted-foreground">
            Selecciona una prenda para ver la vista previa
          </div>
        )}
      </section>
    </div>
  );
}
