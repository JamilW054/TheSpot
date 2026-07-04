"use client";

import { HelpCircle, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export interface EditorHeaderProps {
  projectName?: string;
}

export function EditorHeader({
  projectName = "Nuevo diseño",
}: EditorHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur-sm">
      <Link
        href="/cuenta"
        className="text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
      >
        Buxxep
      </Link>

      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
        <span className="text-sm font-medium text-foreground">
          {projectName}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="editor-btn-secondary rounded-lg px-3 py-2 text-sm font-medium text-foreground"
        >
          Exportar
        </button>
        <button
          type="button"
          className="editor-btn-primary rounded-lg px-4 py-2 text-sm font-medium"
        >
          Guardar
        </button>
        <div className="ml-1 flex items-center gap-0.5">
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Más opciones"
          >
            <MoreHorizontal className="size-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Ayuda"
          >
            <HelpCircle className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
