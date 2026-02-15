"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import type { CanvasElement } from "@/types";

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

/** Exported for use in DragOverlay preview */
export function ElementContent({ el }: { el: CanvasElement }) {
  return el.type === "text" ? (
    <span className="flex min-h-0 min-w-0 flex-1 items-center px-2 py-1 break-words">
      {el.content != null && el.content !== "" ? (
        el.content
      ) : (
        <span className="text-muted-foreground">Texto</span>
      )}
    </span>
  ) : el.type === "shape" ? (
    <div
      className={`h-full w-full border-2 border-primary bg-primary/20 ${el.content === "circle" ? "rounded-full" : "rounded"}`}
    />
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
  ) : null;
}

interface DraggableElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function DraggableElement({ element, isSelected, onSelect }: DraggableElementProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: element.id,
    data: { kind: "element" as const },
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
      aria-label={`Elemento ${element.type}, clic para seleccionar. Seleccionado: ${isSelected}`}
    >
      <div
        className="flex shrink-0 cursor-grab touch-none items-center justify-center self-start rounded-bl bg-muted/50 p-0.5 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        title="Arrastra para mover"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="size-3.5" />
      </div>
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
