"use client";

import { useDroppable } from "@dnd-kit/core";
import type { UniqueIdentifier } from "@dnd-kit/core";

export interface CanvasDropZoneProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
}

export function CanvasDropZone({ id, children }: CanvasDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`relative h-full min-h-[320px] w-full ${isOver ? "bg-primary/5" : ""}`}
    >
      {children}
    </div>
  );
}
