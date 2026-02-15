"use client";

import { useDraggable } from "@dnd-kit/core";
import { FolderOpen, Image, Menu, Move, Pencil, Plus, Redo2, Square, Type, Upload } from "lucide-react";
import { useRef } from "react";
import type { EditorTool } from "@/config/editor-tools";
import { EDITOR_TOOLS } from "@/config/editor-tools";

const ICON_BY_NAME: Record<string, React.ComponentType<{ className?: string }>> = {
  Image,
  Type,
  Square,
};

function DraggableToolButton({
  tool,
  isActive,
}: {
  tool: EditorTool;
  isActive?: boolean;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: tool.id,
    data: { type: tool.type },
  });
  const Icon = tool.iconName ? ICON_BY_NAME[tool.iconName] : null;

  const dragTitle =
    tool.type === "text"
      ? "Texto: arrastra al canvas para añadir"
      : tool.type === "image"
        ? "Imagen: arrastra al canvas para añadir"
        : "Forma: arrastra al canvas para añadir";

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
        isActive
          ? "bg-primary/20 text-primary shadow-inner"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      title={dragTitle}
    >
      {Icon ? <Icon className="size-5" /> : null}
    </button>
  );
}

export interface EditorToolbarProps {
  onAddImageFromFile?: (file: File) => void;
  activeTool?: string;
}

const btn =
  "flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground";

export function EditorToolbar({ onAddImageFromFile, activeTool = "move" }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file != null && onAddImageFromFile) onAddImageFromFile(file);
    e.target.value = "";
  };

  return (
    <aside
      className="flex w-16 shrink-0 flex-col border-r border-border bg-card py-4"
      aria-label="Herramientas del editor"
    >
      {/* Archivo */}
      <div className="flex flex-col items-center gap-1 px-2">
        <button type="button" className={btn} title="Menú">
          <Menu className="size-5" />
        </button>
        <button type="button" className={btn} title="Archivo">
          <FolderOpen className="size-5" />
        </button>
      </div>

      <div className="my-3 h-px w-8 bg-border" role="separator" />

      {/* Insertar en canvas */}
      <div className="flex flex-col items-center gap-1.5 px-2">
        <button type="button" className={btn} title="Añadir elemento">
          <Plus className="size-5" />
        </button>
        <button
          type="button"
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
            activeTool === "move"
              ? "bg-primary/20 text-primary shadow-inner"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="Seleccionar elementos. Arrastra los elementos en el canvas para moverlos."
        >
          <Move className="size-5" />
        </button>
        {EDITOR_TOOLS.map((tool) => (
          <DraggableToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
          />
        ))}
        {onAddImageFromFile && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Subir imagen"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={btn}
              title="Subir imagen al canvas (o arrastra el icono de imagen)"
            >
              <Upload className="size-5" />
            </button>
          </>
        )}
        <button type="button" className={btn} title="Dibujar">
          <Pencil className="size-5" />
        </button>
      </div>

      <div className="my-3 h-px w-8 bg-border" role="separator" />

      {/* Deshacer / Rehacer */}
      <div className="flex flex-col items-center gap-1 px-2">
        <button
          type="button"
          className={btn}
          title="Deshacer"
        >
          <Redo2 className="size-4 rotate-180" />
        </button>
        <button
          type="button"
          className={btn}
          title="Rehacer"
        >
          <Redo2 className="size-4" />
        </button>
      </div>
    </aside>
  );
}
