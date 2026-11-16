import { PageLayout } from "@/components/layout";
import { couponsRepo } from "@/database/repositories/repositories";
import { CuponesManager } from "@/features/admin/cupones-manager";
import { requirePanelStore } from "@/lib/auth/store-actor";

export const dynamic = "force-dynamic";

export default async function PanelCuponesPage() {
  const { store } = await requirePanelStore();
  const rows = await couponsRepo.findMany({ filters: { store_id: store.id } });
  return (
    <PageLayout
      title="Cupones"
      description="Códigos de descuento para tus productos: porcentaje o monto fijo, con límites y vigencia."
    >
      <CuponesManager initialRows={rows} />
    </PageLayout>
  );
}
