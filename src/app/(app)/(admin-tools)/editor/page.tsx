import { EditorLayout } from "@/components/editor";
import {
  getDesignById,
  getDesignBySlug,
  getMockups,
  getProductById,
} from "@/database/repositories";

/**
 * Página del editor de diseños.
 * - Sin query: canvas vacío (nuevo diseño) o borrador restaurado de localStorage.
 * - ?design=id: carga el diseño por id (edición del original).
 * - ?copy=id: (legado) copia local de un diseño por id; el catálogo ya no enlaza plantillas.
 * - ?product=id: abre el editor con el producto del catálogo (prenda inicial si hay mockups).
 * - ?draft=id: carga un borrador guardado localmente (lista en Mis diseños).
 */
interface EditorPageProps {
  searchParams:
    | Promise<{
        design?: string;
        copy?: string;
        product?: string;
        draft?: string;
      }>
    | { design?: string; copy?: string; product?: string; draft?: string };
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const resolved = await Promise.resolve(searchParams);
  const designIdParam = resolved?.design ?? null;
  const copyId = resolved?.copy ?? null;
  const productId = resolved?.product ?? null;
  const draftId = resolved?.draft ?? null;

  const [mockups, designById, designBySlug, catalogProduct] = await Promise.all(
    [
      getMockups(),
      designIdParam || copyId
        ? getDesignById(designIdParam ?? copyId ?? "")
        : Promise.resolve(null),
      designIdParam || copyId
        ? getDesignBySlug(designIdParam ?? copyId ?? "")
        : Promise.resolve(null),
      productId ? getProductById(productId) : Promise.resolve(null),
    ],
  );

  const design = designById ?? designBySlug ?? null;
  const isCopy = copyId != null;
  const initialElements = design?.canvasElements ?? [];
  const designId = isCopy ? null : designIdParam;
  const initialMockupModelPath = catalogProduct?.modelPath ?? null;

  return (
    <div className="scrollbar-hide -m-4 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden sm:-m-6">
      <EditorLayout
        key={`${designId ?? "new"}-${copyId ?? ""}-${productId ?? ""}-${draftId ?? ""}`}
        initialElements={initialElements}
        designId={designId}
        initialMockupModelPath={initialMockupModelPath}
        initialProductId={productId}
        initialDraftId={draftId}
        mockups={mockups}
      />
    </div>
  );
}
