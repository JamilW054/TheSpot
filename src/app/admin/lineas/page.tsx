import { PageLayout } from "@/components/layout";
import { LineasManager } from "@/features/admin/lineas-manager";
import { lineasAdminRepo } from "@/database/repositories/repositories";

export default async function AdminLineasPage() {
  const rows = await lineasAdminRepo.findMany();
  return (
    <PageLayout
      title="Líneas de ropa"
      description="Colecciones y líneas de ropa disponibles en la tienda."
    >
      <LineasManager initialRows={rows} />
    </PageLayout>
  );
}
