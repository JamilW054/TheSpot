import { PageLayout } from "@/components/layout";
import { SubcategoriasManager } from "@/features/admin/subcategorias-manager";
import {
  categoryOptionsRepo,
  sizePresetOptionsRepo,
  subcategoriesRepo,
} from "@/database/repositories/repositories";

export default async function AdminSubcategoriasPage() {
  const [rows, cats, presets] = await Promise.all([
    subcategoriesRepo.findMany(),
    categoryOptionsRepo.findMany(),
    sizePresetOptionsRepo.findMany(),
  ]);
  const catOpts = cats.map((c) => ({ value: c.id, label: c.name }));
  const presetOpts = presets.map((p) => ({ value: p.id, label: p.name }));
  const catName = new Map(cats.map((c) => [c.id, c.name]));

  return (
    <PageLayout
      title="Subcategorías"
      description="Subdivisiones dentro de cada categoría del catálogo."
    >
      <SubcategoriasManager
        initialRows={rows}
        categoryOptions={catOpts}
        sizePresetOptions={presetOpts}
        catName={catName}
      />
    </PageLayout>
  );
}
