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
}

export function CanvasElementNodes({ elements }: CanvasElementNodesProps) {
  return (
    <>
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute flex items-center justify-center overflow-hidden rounded border border-border bg-background px-2 py-1 text-sm text-foreground shadow-sm"
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
          {el.type === "image" ? (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ImagePlaceholderIcon className="text-muted-foreground" />
            </div>
          ) : null}
        </div>
      ))}
    </>
  );
}
