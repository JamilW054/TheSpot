import { PageLayout } from "@/components/layout";
import { brandFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminCreateBrand } from "@/lib/actions/admin-crud";

export default function AdminMarcaNuevaPage() {
  return (
    <PageLayout
      title="Nueva marca"
      description="Crea una marca para el catálogo."
    >
      <ResourceForm
        mode="create"
        entityLabel="la marca"
        listHref="/admin/marcas"
        action={adminCreateBrand}
        fields={brandFields()}
      />
    </PageLayout>
  );
}
