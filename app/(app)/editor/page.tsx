import { EditorLayout } from "@/components/editor";
import { MOCK_CATALOG_PRODUCTS, MOCK_DESIGNS } from "@/config/mock-data";

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

  const isCopy = copyId != null;
  const sourceDesignId = isCopy ? copyId : designIdParam;
  const design = sourceDesignId != null ? MOCK_DESIGNS.find((d) => d.id === sourceDesignId) : null;
  const initialElements = design?.canvasElements ?? [];
  const designId = isCopy ? null : designIdParam;

  const catalogProduct = productId != null ? MOCK_CATALOG_PRODUCTS.find((p) => p.id === productId) : null;
  const initialMockupModelPath = catalogProduct?.modelPath ?? null;

  return (
    <div className="-m-4 flex h-[calc(100vh-3.5rem)] flex-col sm:-m-6">
      <EditorLayout
        key={`${designId ?? "new"}-${copyId ?? ""}-${productId ?? ""}`}
        initialElements={initialElements}
        designId={designId}
        initialMockupModelPath={initialMockupModelPath}
      />
    </div>
  );
}
