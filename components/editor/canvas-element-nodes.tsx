"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Lock } from "lucide-react";
import type { CanvasElement, ShapeKind } from "@/types";

function PathPreview({ el }: { el: CanvasElement }) {
  if (el.type !== "path" || !el.pathData) return null;
  let points: [number, number][];
  try {
    points = JSON.parse(el.pathData) as [number, number][];
  } catch {
    return <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Trazo</div>;
  }
  if (points.length < 2) return null;
  const ox = el.x;
  const oy = el.y;
  const d = points
    .map(([px, py], i) => `${i === 0 ? "M" : "L"} ${px - ox} ${py - oy}`)
    .join(" ");
  const stroke = el.strokeColor ?? "#000000";
  const style = el.brushStyle ?? "round";
  const baseWidth = el.strokeWidth ?? 3;
  const strokeWidth = style === "marker" ? baseWidth * 1.8 : baseWidth;
  const lineCap = style === "square" ? "butt" : "round";
  const lineJoin = style === "square" ? "miter" : "round";
  return (
    <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${el.width} ${el.height}`} preserveAspectRatio="none">
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap={lineCap} strokeLinejoin={lineJoin} />
    </svg>
  );
}

function ImagePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function ShapeContent({ el }: { el: CanvasElement }) {
  if (el.type !== "shape") return null;
  const kind: ShapeKind = el.shapeKind ?? (el.content === "circle" ? "circle" : "rect");
  const fill = el.fillColor ?? "#6366f1";
  const stroke = el.shapeStrokeColor ?? "#4f46e5";
  const strokeW = el.shapeStrokeWidth ?? 2;
  const opacity = el.opacity ?? 1;
  const radius = el.borderRadius ?? 0;
  const shadow = el.boxShadow ?? "";
  const style: React.CSSProperties = {
    backgroundColor: fill,
    borderColor: stroke,
    borderWidth: strokeW,
    opacity,
    borderRadius: kind === "circle" ? "50%" : `${radius}px`,
    boxShadow: shadow || undefined,
  };
  if (kind === "circle") {
    return <div className="h-full w-full rounded-full border" style={style} />;
  }
  if (kind === "triangle") {
    const w = el.width;
    const h = el.height;
    return (
      <svg className="h-full w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polygon
          points={`${w / 2},0 ${w},${h} 0,${h}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeW}
          style={{ opacity }}
        />
      </svg>
    );
  }
  if (kind === "star") {
    const cx = el.width / 2;
    const cy = el.height / 2;
    const r1 = Math.min(el.width, el.height) * 0.2;
    const r2 = Math.min(el.width, el.height) * 0.45;
    const points: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? r2 : r1;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ") + " Z";
    return (
      <svg className="h-full w-full" viewBox={`0 0 ${el.width} ${el.height}`} preserveAspectRatio="none">
        <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeW} style={{ opacity }} />
      </svg>
    );
  }
  return <div className="h-full w-full border" style={style} />;
}

/** Exported for use in DragOverlay preview */
export function ElementContent({ el }: { el: CanvasElement }) {
  return el.type === "text" ? (
    <span
      className="flex min-h-0 min-w-0 flex-1 items-center px-2 py-1 break-words"
      style={{
        fontSize: el.fontSize ?? 14,
        fontFamily: el.fontFamily ?? "inherit",
        color: el.textColor ?? "#111",
        letterSpacing: el.letterSpacing != null ? `${el.letterSpacing}px` : undefined,
        lineHeight: el.lineHeight ?? 1.2,
        textAlign: el.textAlign ?? "left",
      }}
    >
      {el.content != null && el.content !== "" ? (
        el.content
      ) : (
        <span className="text-muted-foreground">Escribe tu texto</span>
      )}
    </span>
  ) : el.type === "shape" ? (
    <ShapeContent el={el} />
  ) : el.type === "image" ? (
    el.content ? (
      <img
        src={el.content}
        alt=""
        className="h-full w-full object-cover"
        width={el.width}
        height={el.height}
        draggable={false}
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <ImagePlaceholderIcon className="text-muted-foreground" />
      </div>
    )
  ) : el.type === "path" ? (
    <PathPreview el={el} />
  ) : null;
}

interface DraggableElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function DraggableElement({ element, isSelected, onSelect }: DraggableElementProps) {
  const isLocked = element.locked === true;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: element.id,
    data: { kind: "element" as const },
    disabled: isLocked,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(element.id);
  };

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      className={`absolute flex overflow-hidden rounded border bg-background text-sm text-foreground shadow-sm outline-none transition-shadow ${isDragging ? "z-50 opacity-90 ring-2 ring-primary" : ""} ${isSelected ? "ring-2 ring-primary ring-offset-2 border-primary" : "border-border"}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onSelect(element.id);
        }
      }}
      aria-label={`Elemento ${element.type}${isLocked ? ", bloqueado" : ""}. Seleccionado: ${isSelected}`}
    >
      {!isLocked && (
        <div
          className="flex shrink-0 cursor-grab touch-none items-center justify-center self-start rounded-bl bg-muted/50 p-0.5 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          title="Arrastra para mover (flechas: microajuste)"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="size-3.5" />
        </div>
      )}
      {isLocked && (
        <div className="flex shrink-0 items-center justify-center self-start rounded-bl bg-muted/30 p-0.5 text-muted-foreground" title="Bloqueado">
          <Lock className="size-3.5" />
        </div>
      )}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col" onClick={handleClick}>
        <ElementContent el={element} />
      </div>
    </div>
  );
}

export interface CanvasElementNodesProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
}

export function CanvasElementNodes({
  elements,
  selectedId,
  onSelectElement,
}: CanvasElementNodesProps) {
  return (
    <>
      {elements.map((el) => {
        if (el.visible === false) return null;
        return (
          <DraggableElement
            key={el.id}
            element={el}
            isSelected={el.id === selectedId}
            onSelect={onSelectElement}
          />
        );
      })}
    </>
  );
}
