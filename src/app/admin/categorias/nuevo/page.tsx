import { PageLayout } from "@/components/layout";
import { CategoryForm } from "@/features/admin/category-form";
import { getCategoriesForAdmin } from "@/database/repositories/categories";
import { getSizePresetsForAdmin } from "@/database/repositories/size-presets";

export default async function AdminCategoriasNuevoPage() {
  const [sizePresets, categories] = await Promise.all([
    getSizePresetsForAdmin(),
    getCategoriesForAdmin(),
  ]);
  return (
    <PageLayout
      title="Nueva categoría"
      description="Nombre, slug opcional, orden, miniatura, categoría padre y tipo de talla o tamaño."
    >
      <CategoryForm
        mode="create"
        sizePresets={sizePresets}
        categories={categories}
      />
    </PageLayout>
  );
}
