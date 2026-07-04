import { PageLayout } from "@/components/layout";
import { couponFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminCreateCoupon } from "@/lib/actions/admin-crud";

export default function AdminCuponNuevoPage() {
  return (
    <PageLayout title="Nuevo cupón" description="Crea un código de descuento.">
      <ResourceForm
        mode="create"
        entityLabel="el cupón"
        listHref="/admin/cupones"
        action={adminCreateCoupon}
        fields={couponFields()}
      />
    </PageLayout>
  );
}
