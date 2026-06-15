import { PageLayout } from "@/components/layout";
import { CuponesManager } from "@/features/admin/cupones-manager";
import { couponsRepo } from "@/lib/db/repositories";

export default async function AdminCuponesPage() {
  const rows = await couponsRepo.findMany();
  return (
    <PageLayout
      title="Cupones"
      description="Códigos de descuento: porcentaje o monto fijo, con límites y vigencia."
    >
      <CuponesManager initialRows={rows} />
    </PageLayout>
  );
}
