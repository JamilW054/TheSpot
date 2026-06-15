import { PageLayout } from "@/components/layout";
import { CategoriasManager } from "@/features/admin/categorias-manager";
import { getCategoriesForAdmin } from "@/lib/db";
import { getSizePresetsForAdmin } from "@/lib/db/size-presets";

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
