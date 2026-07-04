import { PageLayout } from "@/components/layout";
import { CategoriasManager } from "@/features/admin/categorias-manager";
import { getCategoriesForAdmin } from "@/database/repositories";
import { getSizePresetsForAdmin } from "@/database/repositories/size-presets";

export default async function AdminCategoriasPage() {
  const [rows, sizePresets] = await Promise.all([
    getCategoriesForAdmin(),
    getSizePresetsForAdmin(),
  ]);
  return (
    <PageLayout
      title="Categorías"
      description="CRUD de categorías del catálogo público (slug, orden, miniatura). Los cambios se reflejan en /catalogo."
    >
      <CategoriasManager initialRows={rows} sizePresets={sizePresets} />
    </PageLayout>
  );
}
