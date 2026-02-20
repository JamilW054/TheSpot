import { EditorLayout } from "@/components/editor";
import { MOCK_DESIGNS } from "@/config/mock-data";

/**
 * Página del editor de diseños.
 * - Sin query: canvas vacío (nuevo diseño).
 * - ?design=id: carga el diseño por id (MOCK_DESIGNS por ahora; luego Supabase).
 *   Si el diseño tiene canvasElements, inicializa el canvas con ellos.
 */
interface EditorPageProps {
  searchParams: Promise<{ design?: string }> | { design?: string };
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const resolved = await Promise.resolve(searchParams);
  const designId = resolved?.design ?? null;
  const design = designId != null ? MOCK_DESIGNS.find((d) => d.id === designId) : null;
  const initialElements = design?.canvasElements ?? [];

  return (
    <div className="scrollbar-hide -m-4 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden sm:-m-6">
      <EditorLayout
        key={designId ?? "new"}
        initialElements={initialElements}
        designId={designId}
      />
    </div>
  );
}
