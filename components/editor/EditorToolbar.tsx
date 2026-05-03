"use client";

import { useDraggable } from "@dnd-kit/core";
import { Circle, FolderOpen, Image, Menu, Move, Pencil, Plus, Redo2, Square, Star, Triangle, Type, Upload } from "lucide-react";
import { useRef } from "react";
import type { EditorTool } from "@/config/editor-tools";
import { EDITOR_TOOLS } from "@/config/editor-tools";

const ICON_BY_NAME: Record<string, React.ComponentType<{ className?: string }>> = {
  Image,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Pencil,
};

/** Títulos que indican que la herramienta forma parte del diseño exportado. */
const TOOL_TITLES: Record<string, string> = {
  text: "Texto: se incluye en la textura. Arrastra al canvas para añadir.",
  image: "Imagen: se incluye en la textura. Arrastra al canvas para añadir.",
  shape: "Forma: se incluye en la textura. Arrastra al canvas para añadir.",
  path: "Pincel: se incluye en la textura. Dibuja en el panel 2D o arrastra para añadir trazo.",
};

function DraggableToolButton({
  tool,
  isActive,
  onSelect,
}: {
  tool: EditorTool;
  isActive?: boolean;
  onSelect?: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: tool.id,
    data: { type: tool.type, shapeKind: tool.shapeKind },
  });
  const Icon = tool.iconName ? ICON_BY_NAME[tool.iconName] : null;
  const title = tool.tooltip ?? TOOL_TITLES[tool.type] ?? `${tool.label}. Arrastra al canvas.${tool.shortcut ? ` (${tool.shortcut})` : ""}`;

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      onClick={() => onSelect?.(tool.id)}
      className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
        isActive
          ? "bg-primary/20 text-primary shadow-inner"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
      title={title}
    >
      {Icon ? <Icon className="size-5" /> : null}
    </button>
  );
}

export interface EditorToolbarProps {
  onAddImageFromFile?: (file: File) => void;
  activeTool?: string;
  onToolChange?: (toolId: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onMenuClick?: () => void;
  onOpenClick?: () => void;
  onPlusClick?: () => void;
}

const btn =
  "flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground";

function noop() {}

export function EditorToolbar({
  onAddImageFromFile,
  activeTool = "move",
  onToolChange = noop,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onMenuClick,
  onOpenClick,
  onPlusClick,
}: EditorToolbarProps) {
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
        <button
          type="button"
          onClick={onMenuClick}
          className={btn}
          title="Menú (guardar/exportar el diseño del modelo)"
        >
          <Menu className="size-5" />
        </button>
        <button
          type="button"
          onClick={onOpenClick}
          className={btn}
          title="Abrir diseño (se aplica al modelo 3D)"
        >
          <FolderOpen className="size-5" />
        </button>
      </div>

      <div className="my-3 h-px w-8 bg-border" role="separator" />

      {/* Insertar en canvas */}
      <div className="flex flex-col items-center gap-1.5 px-2">
        <button
          type="button"
          onClick={onPlusClick}
          className={btn}
          title="Añadir elemento al modelo (texto, forma, imagen, pincel)"
        >
          <Plus className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => onToolChange("move")}
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
            activeTool === "move"
              ? "bg-primary/20 text-primary shadow-inner"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="Mover: selecciona y arrastra elementos del diseño sobre el modelo"
        >
          <Move className="size-5" />
        </button>
        {EDITOR_TOOLS.map((tool) => (
          <DraggableToolButton
            key={tool.id}
            tool={tool}
            isActive={activeTool === tool.id}
            onSelect={onToolChange ?? noop}
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
              title="Subir imagen al diseño del modelo (o arrastra el icono de imagen)"
            >
              <Upload className="size-5" />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => onToolChange("tool-brush")}
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
            activeTool === "tool-brush"
              ? "bg-primary/20 text-primary shadow-inner"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          title="Pincel: dibuja sobre el modelo en el panel 2D (zona de diseño)"
        >
          <Pencil className="size-5" />
        </button>
      </div>

      <div className="my-3 h-px w-8 bg-border" role="separator" />

      {/* Deshacer / Rehacer */}
      <div className="flex flex-col items-center gap-1 px-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className={`${btn} disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Deshacer (cambios en el diseño del modelo)"
        >
          <Redo2 className="size-4 rotate-180" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className={`${btn} disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Rehacer (cambios en el diseño del modelo)"
        >
          <Redo2 className="size-4" />
        </button>
      </div>
    </aside>
  );
}
