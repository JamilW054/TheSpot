import { PageLayout } from "@/components/layout";
import { MarcasManager } from "@/features/admin/marcas-manager";
import { brandsRepo } from "@/database/repositories/repositories";

export default async function AdminMarcasPage() {
  const rows = await brandsRepo.findMany();
  return (
    <PageLayout
      title="Marcas"
      description="Marcas del catálogo: crear, editar y desactivar."
    >
      <MarcasManager initialRows={rows} />
    </PageLayout>
  );
}
