"use client";

import { useEffect, useRef } from "react";
import type { CanvasElement, ShapeKind } from "@/types";

export type CanvasElementPatch = Partial<
  Pick<
    CanvasElement,
    | "x"
    | "y"
    | "width"
    | "height"
    | "content"
    | "visible"
    | "locked"
    | "groupId"
    | "pathData"
    | "strokeColor"
    | "strokeWidth"
    | "brushStyle"
    | "brushTexture"
    | "shapeKind"
    | "fillColor"
    | "shapeStrokeColor"
    | "shapeStrokeWidth"
    | "opacity"
    | "borderRadius"
    | "boxShadow"
    | "fontSize"
    | "fontFamily"
    | "textColor"
    | "letterSpacing"
    | "lineHeight"
    | "textAlign"
  >
>;

export interface PropertiesPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onUpdateElement: (id: string, partial: CanvasElementPatch) => void;
  /** Tras insertar texto, llevar foco al textarea de contenido */
  focusTextId?: string;
  onFocusTextDone?: () => void;
}

function clampNum(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function PropertiesPanel({
  elements,
  selectedId,
  onUpdateElement,
  focusTextId,
  onFocusTextDone,
}: PropertiesPanelProps) {
  const textContentRef = useRef<HTMLTextAreaElement>(null);
  const element = selectedId
    ? elements.find((el) => el.id === selectedId)
    : null;

  // Llevar scroll y foco al texto cuando se acaba de insertar (pendingFocusTextId)
  useEffect(() => {
    if (!focusTextId || !selectedId || focusTextId !== selectedId || element?.type !== "text") return;
    const ta = textContentRef.current;
    if (!ta) return;
    const t = setTimeout(() => {
      ta.scrollIntoView({ behavior: "smooth", block: "nearest" });
      ta.focus();
      onFocusTextDone?.();
    }, 100);
    return () => clearTimeout(t);
  }, [focusTextId, selectedId, element?.type, onFocusTextDone]);

  if (!selectedId || !element) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        Selecciona un elemento del canvas para editar sus propiedades.
      </p>
    );
  }

  const STEP_POS = 1;
  const STEP_SIZE = 10;
  const SHAPE_KINDS: { value: ShapeKind; label: string }[] = [
    { value: "rect", label: "Rectángulo" },
    { value: "circle", label: "Círculo" },
    { value: "triangle", label: "Triángulo" },
    { value: "star", label: "Estrella" },
  ];
  const FONT_FAMILIES = ["Inter", "system-ui", "Georgia", "serif", "monospace"];

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
        <label htmlFor="prop-x" className="text-muted-foreground" title="Flechas: 1px. Mayús+Flechas: 8px (cuadrícula)">
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
        <label htmlFor="prop-y" className="text-muted-foreground" title="Flechas: 1px. Mayús+Flechas: 8px (cuadrícula)">
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
      <div className="pt-2 border-t border-border">
        <label className="text-muted-foreground flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={element.locked === true}
            onChange={(e) => onUpdateElement(element.id, { locked: e.target.checked })}
            className="rounded border-border"
          />
          Bloquear elemento
        </label>
      </div>
      {element.type === "shape" && (
        <div className="space-y-2 pt-2 border-t border-border">
          <label className="text-muted-foreground block text-xs">Forma</label>
          <select
            value={element.shapeKind ?? "rect"}
            onChange={(e) => onUpdateElement(element.id, { shapeKind: e.target.value as ShapeKind })}
            className={inputCn}
          >
            {SHAPE_KINDS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-muted-foreground block text-xs">Relleno</label>
              <input
                type="color"
                value={element.fillColor ?? "#6366f1"}
                onChange={(e) => onUpdateElement(element.id, { fillColor: e.target.value })}
                className="h-8 w-full rounded border border-border cursor-pointer"
              />
            </div>
            <div>
              <label className="text-muted-foreground block text-xs">Borde</label>
              <input
                type="color"
                value={element.shapeStrokeColor ?? "#4f46e5"}
                onChange={(e) => onUpdateElement(element.id, { shapeStrokeColor: e.target.value })}
                className="h-8 w-full rounded border border-border cursor-pointer"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-muted-foreground text-xs">Grosor borde</label>
            <input
              type="number"
              min={0}
              max={20}
              value={element.shapeStrokeWidth ?? 2}
              onChange={(e) => onUpdateElement(element.id, { shapeStrokeWidth: Math.max(0, Math.min(20, Number(e.target.value) || 0)) })}
              className={inputCn}
            />
            <label className="text-muted-foreground text-xs">Opacidad</label>
            <input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={element.opacity ?? 1}
              onChange={(e) => onUpdateElement(element.id, { opacity: Math.max(0, Math.min(1, Number(e.target.value) || 1)) })}
              className={inputCn}
            />
          </div>
          {(element.shapeKind ?? "rect") === "rect" && (
            <>
              <label className="text-muted-foreground text-xs">Esquinas redondeadas (px)</label>
              <input
                type="number"
                min={0}
                value={element.borderRadius ?? 0}
                onChange={(e) => onUpdateElement(element.id, { borderRadius: Math.max(0, Number(e.target.value) || 0) })}
                className={inputCn}
              />
            </>
          )}
        </div>
      )}
      {element.type === "image" && (
        <div className="space-y-2 pt-2 border-t border-border">
          <label htmlFor="prop-image-url" className="text-muted-foreground block">
            URL de la imagen
          </label>
          <input
            id="prop-image-url"
            type="url"
            value={element.content ?? ""}
            onChange={handleContent}
            placeholder="https://… o deja vacío y usa Subir imagen en el sidebar"
            className="rounded border border-border bg-background px-2 py-1 text-foreground w-full min-w-0 text-sm"
            aria-label="URL de la imagen del elemento"
          />
          <p className="text-xs text-muted-foreground">
            Arrastra &quot;Imagen&quot; al canvas y pega aquí la URL, o usa &quot;Subir imagen&quot; en el sidebar. Puedes mover y redimensionar con los valores de posición y tamaño.
          </p>
        </div>
      )}
      {element.type === "text" && (
        <div className="space-y-2 pt-2 border-t border-border">
          <label htmlFor="prop-content" className="text-muted-foreground block">
            Editar texto
          </label>
          <textarea
            ref={textContentRef}
            id="prop-content"
            rows={3}
            value={element.content ?? ""}
            onChange={handleContent}
            placeholder="Escribe tu texto aquí"
            className="rounded border border-border bg-background px-2 py-1 text-foreground w-full resize-y min-h-16"
            aria-label="Editar texto del elemento"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-muted-foreground text-xs">Tamaño (px)</label>
              <input
                type="number"
                min={8}
                max={120}
                value={element.fontSize ?? 14}
                onChange={(e) => onUpdateElement(element.id, { fontSize: Math.max(8, Math.min(120, Number(e.target.value) || 14)) })}
                className={inputCn}
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs">Color</label>
              <input
                type="color"
                value={element.textColor ?? "#111111"}
                onChange={(e) => onUpdateElement(element.id, { textColor: e.target.value })}
                className="h-8 w-full rounded border border-border cursor-pointer"
              />
            </div>
          </div>
          <label className="text-muted-foreground text-xs">Fuente</label>
          <select
            value={element.fontFamily ?? "inherit"}
            onChange={(e) => onUpdateElement(element.id, { fontFamily: e.target.value })}
            className={inputCn}
          >
            <option value="inherit">Por defecto</option>
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-muted-foreground text-xs">Espaciado letras</label>
            <input
              type="number"
              value={element.letterSpacing ?? 0}
              onChange={(e) => onUpdateElement(element.id, { letterSpacing: Number(e.target.value) || 0 })}
              className={inputCn}
            />
            <label className="text-muted-foreground text-xs">Interlineado</label>
            <input
              type="number"
              min={0.5}
              max={3}
              step={0.1}
              value={element.lineHeight ?? 1.2}
              onChange={(e) => onUpdateElement(element.id, { lineHeight: Math.max(0.5, Math.min(3, Number(e.target.value) || 1.2)) })}
              className={inputCn}
            />
          </div>
          <label className="text-muted-foreground text-xs">Alineación</label>
          <select
            value={element.textAlign ?? "left"}
            onChange={(e) => onUpdateElement(element.id, { textAlign: e.target.value as "left" | "center" | "right" })}
            className={inputCn}
          >
            <option value="left">Izquierda</option>
            <option value="center">Centro</option>
            <option value="right">Derecha</option>
          </select>
        </div>
      )}
      {element.type === "path" && (
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center">
            <label htmlFor="prop-stroke-color" className="text-muted-foreground">
              Color
            </label>
            <input
              id="prop-stroke-color"
              type="color"
              value={element.strokeColor ?? "#000000"}
              onChange={(e) => onUpdateElement(element.id, { strokeColor: e.target.value })}
              className="h-8 w-full min-w-0 rounded border border-border bg-background cursor-pointer"
            />
            <label htmlFor="prop-stroke-width" className="text-muted-foreground">
              Grosor
            </label>
            <input
              id="prop-stroke-width"
              type="number"
              min={1}
              max={30}
              value={element.strokeWidth ?? 3}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v)) onUpdateElement(element.id, { strokeWidth: Math.max(1, Math.min(30, v)) });
              }}
              className={inputCn}
            />
            <label htmlFor="prop-brush-style" className="text-muted-foreground">
              Estilo brocha
            </label>
            <select
              id="prop-brush-style"
              value={element.brushStyle ?? "round"}
              onChange={(e) => onUpdateElement(element.id, { brushStyle: e.target.value as "round" | "square" | "marker" })}
              className={inputCn}
            >
              <option value="round">Redondo (suave)</option>
              <option value="square">Cuadrado (corte)</option>
              <option value="marker">Marker (grueso)</option>
            </select>
            <label htmlFor="prop-brush-texture" className="text-muted-foreground">
              Textura (URL)
            </label>
            <input
              id="prop-brush-texture"
              type="url"
              placeholder="Opcional"
              value={element.brushTexture ?? ""}
              onChange={(e) => onUpdateElement(element.id, { brushTexture: e.target.value || undefined })}
              className={inputCn}
            />
          </div>
        </div>
      )}
    </div>
  );
}
