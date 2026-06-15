import { PageLayout } from "@/components/layout";
import { warehouseFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminCreateWarehouse } from "@/lib/actions/admin-crud";

export default function AdminAlmacenNuevoPage() {
  return (
    <PageLayout title="Nuevo almacén">
      <ResourceForm
        mode="create"
        entityLabel="el almacén"
        listHref="/admin/almacenes"
        action={adminCreateWarehouse}
        fields={warehouseFields()}
      />
    </PageLayout>
  );
}
