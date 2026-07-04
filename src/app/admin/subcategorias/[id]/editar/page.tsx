import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { subcategoryFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminUpdateSubcategory } from "@/lib/actions/admin-crud";
import {
  categoryOptionsRepo,
  sizePresetOptionsRepo,
  subcategoriesRepo,
} from "@/database/repositories/repositories";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSubcategoriaEditarPage({
  params,
}: PageProps) {
  const { id } = await params;
  const [sub, cats, presets] = await Promise.all([
    subcategoriesRepo.findById(id),
    categoryOptionsRepo.findMany(),
    sizePresetOptionsRepo.findMany(),
  ]);
  if (!sub) notFound();
  const catOpts = cats.map((c) => ({ value: c.id, label: c.name }));
  const presetOpts = presets.map((p) => ({ value: p.id, label: p.name }));

  return (
    <PageLayout title={`Editar subcategoría: ${sub.name}`}>
      <ResourceForm
        mode="edit"
        idFieldName="subcategory_id"
        idValue={sub.id}
        entityLabel="la subcategoría"
        listHref="/admin/subcategorias"
        action={adminUpdateSubcategory}
        fields={subcategoryFields(catOpts, presetOpts, sub)}
      />
    </PageLayout>
  );
}
