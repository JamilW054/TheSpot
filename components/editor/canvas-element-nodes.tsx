"use client";

import type { CanvasElement } from "@/types";

export interface CanvasElementNodesProps {
  elements: CanvasElement[];
}

export function CanvasElementNodes({ elements }: CanvasElementNodesProps) {
  return (
    <>
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute flex items-center justify-center rounded border border-border bg-background px-2 py-1 text-sm text-foreground shadow-sm"
          style={{
            left: el.x,
            top: el.y,
            width: el.width,
            height: el.height,
          }}
        >
          {el.type === "text" && (el.content ?? "").trim() !== ""
            ? el.content
            : null}
          {el.type === "shape" ? "◇" : null}
          {el.type === "image" ? "🖼" : null}
        </div>
      ))}
    </>
  );
}
