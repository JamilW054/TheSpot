"use client";

/**
 * Sidebar izquierdo del editor: herramientas (herramientas de diseño, formas, texto, etc.).
 * Placeholder; la lógica de herramientas se implementará en pasos siguientes.
 */
export function EditorSidebar() {
  return (
    <aside
      className="flex w-56 shrink-0 flex-col border-r border-border bg-muted/30 p-3"
      aria-label="Herramientas del editor"
    >
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Herramientas
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        (Placeholder: selector, formas, texto, imágenes…)
      </p>
    </aside>
  );
}
