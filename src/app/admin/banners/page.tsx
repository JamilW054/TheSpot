import { PageLayout } from "@/components/layout";
import { BannersManager } from "@/features/admin/banners-manager";
import { bannersRepo } from "@/database/repositories/repositories";

export default async function AdminBannersPage() {
  const rows = await bannersRepo.findMany();
  return (
    <PageLayout
      title="Banners"
      description="Banners promocionales de la tienda con orden y vigencia."
    >
      <BannersManager initialRows={rows} />
    </PageLayout>
  );
}
