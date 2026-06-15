import { PageLayout } from "@/components/layout";
import { subcategoryFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminCreateSubcategory } from "@/lib/actions/admin-crud";
import {
  categoryOptionsRepo,
  sizePresetOptionsRepo,
} from "@/lib/db/repositories";

export default async function AdminSubcategoriaNuevaPage() {
  const [cats, presets] = await Promise.all([
    categoryOptionsRepo.findMany(),
    sizePresetOptionsRepo.findMany(),
  ]);
  const catOpts = cats.map((c) => ({ value: c.id, label: c.name }));
  const presetOpts = presets.map((p) => ({ value: p.id, label: p.name }));

  return (
    <PageLayout title="Nueva subcategoría">
      <ResourceForm
        mode="create"
        entityLabel="la subcategoría"
        listHref="/admin/subcategorias"
        action={adminCreateSubcategory}
        fields={subcategoryFields(catOpts, presetOpts)}
      />
    </PageLayout>
  );
}
