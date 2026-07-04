import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { couponFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminUpdateCoupon } from "@/lib/actions/admin-crud";
import { couponsRepo } from "@/database/repositories/repositories";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCuponEditarPage({ params }: PageProps) {
  const { id } = await params;
  const coupon = await couponsRepo.findById(id);
  if (!coupon) notFound();

  return (
    <PageLayout title={`Editar cupón: ${coupon.code}`}>
      <ResourceForm
        mode="edit"
        idFieldName="coupon_id"
        idValue={coupon.id}
        entityLabel="el cupón"
        listHref="/admin/cupones"
        action={adminUpdateCoupon}
        fields={couponFields(coupon)}
      />
    </PageLayout>
  );
}
