import { PageLayout } from "@/components/layout";
import { CategoryForm } from "@/features/admin/category-form";

export default function AdminCategoriasNuevoPage() {
  return (
    <PageLayout
      title="Nueva categoría"
      description="Nombre, slug opcional, orden y URL de miniatura."
    >
      <CategoryForm mode="create" />
    </PageLayout>
  );
}
