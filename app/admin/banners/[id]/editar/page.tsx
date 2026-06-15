import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout";
import { bannerFields } from "@/features/admin/resource-fields";
import { ResourceForm } from "@/features/admin/resource-form";
import { adminUpdateBanner } from "@/lib/actions/admin-crud";
import { bannersRepo } from "@/lib/db/repositories";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminBannerEditarPage({ params }: PageProps) {
  const { id } = await params;
  const banner = await bannersRepo.findById(id);
  if (!banner) notFound();

  return (
    <PageLayout title={`Editar banner: ${banner.title}`}>
      <ResourceForm
        mode="edit"
        idFieldName="banner_id"
        idValue={banner.id}
        entityLabel="el banner"
        listHref="/admin/banners"
        action={adminUpdateBanner}
        fields={bannerFields(banner)}
      />
    </PageLayout>
  );
}
