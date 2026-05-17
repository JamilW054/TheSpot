import { PageLayout } from "@/components/layout";
import { CategoryForm } from "@/features/admin/category-form";
import { getSizePresetsForAdmin } from "@/lib/db/size-presets";

export default async function AdminCategoriasNuevoPage() {
  const sizePresets = await getSizePresetsForAdmin();
  return (
    <PageLayout
      title="Nueva categoría"
      description="Nombre, slug opcional, orden, URL de miniatura y tipo de tallas."
    >
      <CategoryForm mode="create" sizePresets={sizePresets} />
    </PageLayout>
  );
}
