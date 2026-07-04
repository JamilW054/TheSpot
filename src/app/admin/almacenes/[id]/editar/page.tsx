import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { warehouseFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminUpdateWarehouse } from "@/lib/actions/admin-crud";
import { warehousesRepo } from "@/database/repositories/repositories";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminAlmacenEditarPage({ params }: PageProps) {
  const { id } = await params;
  const warehouse = await warehousesRepo.findById(id);
  if (!warehouse) notFound();

  return (
    <PageLayout title={`Editar almacén: ${warehouse.name}`}>
      <ResourceForm
        mode="edit"
        idFieldName="warehouse_id"
        idValue={warehouse.id}
        entityLabel="el almacén"
        listHref="/admin/almacenes"
        action={adminUpdateWarehouse}
        fields={warehouseFields(warehouse)}
      />
    </PageLayout>
  );
}
