"use client";

import { useDroppable } from "@dnd-kit/core";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface CanvasDropZoneProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
  onBackgroundClick?: () => void;
}

export function CanvasDropZone({ id, children, onBackgroundClick }: CanvasDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      className={`relative h-full min-h-[320px] w-full cursor-default ${isOver ? "bg-primary/5" : ""}`}
      onClick={onBackgroundClick}
      onKeyDown={(e) => e.key === "Enter" && onBackgroundClick?.()}
      aria-label="Canvas, clic para deseleccionar"
    >
      {children}
    </div>
  );
}
