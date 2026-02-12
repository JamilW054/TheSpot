"use client";

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
        const isSelected = el.id === selectedId;
        return (
          <div
            key={el.id}
            role="button"
            tabIndex={0}
            className={`absolute flex cursor-pointer overflow-hidden rounded border bg-background text-sm text-foreground shadow-sm outline-none transition-shadow ${isSelected ? "ring-2 ring-primary ring-offset-2 border-primary" : "border-border"}`}
            style={{
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectElement(el.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onSelectElement(el.id);
              }
            }}
            aria-label={`Elemento ${el.type}, seleccionado: ${isSelected}`}
          >
          {el.type === "text" ? (
            <span className="flex min-h-0 min-w-0 flex-1 items-center px-2 py-1 wrap-break-word">
              {el.content ?? ""}
            </span>
          ) : el.type === "shape" ? (
            <div
              className={`h-full w-full border-2 border-primary bg-primary/20 ${el.content === "circle" ? "rounded-full" : "rounded"}`}
            />
          ) : el.type === "image" ? (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ImagePlaceholderIcon className="text-muted-foreground" />
            </div>
          ) : null}
          </div>
        );
      })}
    </>
  );
}
