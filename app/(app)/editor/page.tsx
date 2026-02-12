import { EditorCanvas, EditorRightPanel, EditorSidebar } from "@/components/editor";

/**
 * Página del editor de diseños.
 * Layout: tres columnas — sidebar (herramientas) | canvas | panel (propiedades y capas).
 * El AppShell ya proporciona el sidebar de navegación de la app; este sidebar es el de herramientas del editor.
 */
export default function EditorPage() {
  return (
    <div
      className="flex h-full min-h-0 w-full flex-row"
      role="application"
      aria-label="Editor de diseños"
    >
      {/* Sidebar izquierdo: herramientas (selector, formas, texto, imágenes, etc.) */}
      <EditorSidebar />

      {/* Zona central: canvas (área de diseño, DnD, elementos) */}
      <EditorCanvas />

      {/* Panel derecho: propiedades del elemento seleccionado y lista de capas */}
      <EditorRightPanel />
    </div>
  );
}
