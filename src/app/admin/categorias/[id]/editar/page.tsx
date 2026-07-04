import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { CategoryDeleteButton } from "@/features/admin/category-delete-button";
import { CategoryForm } from "@/features/admin/category-form";
import { getCategoryAdminById } from "@/database/repositories";
import { getSizePresetsForAdmin } from "@/database/repositories/size-presets";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCategoriaEditarPage({ params }: PageProps) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const [category, sizePresets] = await Promise.all([
    getCategoryAdminById(id),
    getSizePresetsForAdmin(),
  ]);
  if (!category) notFound();

  return (
    <PageLayout
      title={`Editar: ${category.name}`}
      description="Los cambios de slug actualizan el parámetro ?categoria= en la tienda."
    >
      <div className="mb-4 flex justify-end">
        <CategoryDeleteButton
          categoryId={category.id}
          redirectTo="/admin/categorias"
        />
      </div>
      <CategoryForm mode="edit" initial={category} sizePresets={sizePresets} />
    </PageLayout>
  );
}
