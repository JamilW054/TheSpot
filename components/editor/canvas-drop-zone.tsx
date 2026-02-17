"use client";

import { useDroppable } from "@dnd-kit/core";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface CanvasDropZoneProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
  onBackgroundClick?: () => void;
  /** Si true, no aplica min-height (para el panel derecho). */
  compact?: boolean;
}

export function CanvasDropZone({ id, children, onBackgroundClick, compact }: CanvasDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      className={`relative h-full w-full cursor-default ${compact ? "min-h-0" : "min-h-[320px]"} ${isOver ? "bg-primary/5" : ""}`}
      onClick={onBackgroundClick}
      onKeyDown={(e) => e.key === "Enter" && onBackgroundClick?.()}
      aria-label="Canvas, clic para deseleccionar"
    >
      {children}
    </div>
  );
}
