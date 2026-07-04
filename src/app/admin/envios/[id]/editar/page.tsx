import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { shippingFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminUpdateShippingMethod } from "@/lib/actions/admin-crud";
import { shippingMethodsRepo } from "@/database/repositories/repositories";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEnvioEditarPage({ params }: PageProps) {
  const { id } = await params;
  const method = await shippingMethodsRepo.findById(id);
  if (!method) notFound();

  return (
    <PageLayout title={`Editar envío: ${method.name}`}>
      <ResourceForm
        mode="edit"
        idFieldName="shipping_method_id"
        idValue={method.id}
        entityLabel="el método de envío"
        listHref="/admin/envios"
        action={adminUpdateShippingMethod}
        fields={shippingFields(method)}
      />
    </PageLayout>
  );
}
