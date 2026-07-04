import { PageLayout } from "@/components/layout";
import { shippingFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminCreateShippingMethod } from "@/lib/actions/admin-crud";

export default function AdminEnvioNuevoPage() {
  return (
    <PageLayout title="Nuevo método de envío">
      <ResourceForm
        mode="create"
        entityLabel="el método de envío"
        listHref="/admin/envios"
        action={adminCreateShippingMethod}
        fields={shippingFields()}
      />
    </PageLayout>
  );
}
