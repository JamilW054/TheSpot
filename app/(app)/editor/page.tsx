import { EditorLayout } from "@/components/editor";

/**
 * Página del editor de diseños.
 * Layout: tres columnas — sidebar (herramientas) | canvas (DnD) | panel (propiedades y capas).
 * El AppShell ya proporciona el sidebar de navegación de la app; este sidebar es el de herramientas del editor.
 */
export default function EditorPage() {
  return <EditorLayout />;
}
