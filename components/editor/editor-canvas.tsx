"use client";

/**
 * Área central del editor: canvas donde se edita el diseño (DnD, elementos).
 * Placeholder; el canvas real y la lógica de interacción se implementarán después.
 */
export function EditorCanvas() {
  return (
    <div
      className="flex flex-1 min-w-0 items-center justify-center border border-dashed border-border bg-muted/20 p-4"
      aria-label="Área de diseño"
    >
      <p className="text-sm text-muted-foreground">
        Canvas (placeholder: área de diseño y arrastrar/soltar)
      </p>
    </div>
  );
}
