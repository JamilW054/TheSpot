import { EditorLayout } from "@/components/editor";
import {
  getDesignById,
  getDesignBySlug,
  getMockups,
  getProductById,
} from "@/lib/db";

/**
 * Página del editor de diseños.
 * - Sin query: canvas vacío (nuevo diseño).
 * - ?design=id: carga el diseño por id (edición del original).
 * - ?copy=id: carga el diseño como copia local (designId=null); se crea una copia en tu máquina al editar.
 * - ?product=id: preselecciona la prenda del catálogo (modelPath) en el editor.
 */
interface EditorPageProps {
  searchParams: Promise<{ design?: string; copy?: string; product?: string }> | { design?: string; copy?: string; product?: string };
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const resolved = await Promise.resolve(searchParams);
  const designIdParam = resolved?.design ?? null;
  const copyId = resolved?.copy ?? null;
  const productId = resolved?.product ?? null;

  const [mockups, designById, designBySlug, catalogProduct] = await Promise.all([
    getMockups(),
    designIdParam || copyId ? getDesignById(designIdParam ?? copyId ?? "") : Promise.resolve(null),
    designIdParam || copyId ? getDesignBySlug(designIdParam ?? copyId ?? "") : Promise.resolve(null),
    productId ? getProductById(productId) : Promise.resolve(null),
  ]);

  const design = designById ?? designBySlug ?? null;
  const isCopy = copyId != null;
  const initialElements = design?.canvasElements ?? [];
  const designId = isCopy ? null : designIdParam;
  const initialMockupModelPath = catalogProduct?.modelPath ?? null;

  return (
    <div className="scrollbar-hide -m-4 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden sm:-m-6">
      <EditorLayout
        key={`${designId ?? "new"}-${copyId ?? ""}-${productId ?? ""}`}
        initialElements={initialElements}
        designId={designId}
        initialMockupModelPath={initialMockupModelPath}
        initialProductId={productId}
        mockups={mockups}
      />
    </div>
  );
}
