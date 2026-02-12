"use client";

/**
 * Panel derecho del editor: propiedades del elemento seleccionado y lista de capas.
 * Placeholder; la lógica de propiedades y capas se implementará en pasos siguientes.
 */
export function EditorRightPanel() {
  return (
    <aside
      className="flex w-72 shrink-0 flex-col border-l border-border bg-muted/30 p-3"
      aria-label="Propiedades y capas"
    >
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Propiedades
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        (Placeholder: propiedades del elemento seleccionado)
      </p>
      <h2 className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Capas
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        (Placeholder: lista de capas / orden z)
      </p>
    </aside>
  );
}
