import { PageLayout } from "@/components/layout";
import { bannerFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminCreateBanner } from "@/lib/actions/admin-crud";

export default function AdminBannerNuevoPage() {
  return (
    <PageLayout title="Nuevo banner">
      <ResourceForm
        mode="create"
        entityLabel="el banner"
        listHref="/admin/banners"
        action={adminCreateBanner}
        fields={bannerFields()}
      />
    </PageLayout>
  );
}
