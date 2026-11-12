import { PageLayout } from "@/components/layout";
import { shippingMethodsRepo } from "@/database/repositories/repositories";
import { EnviosManager } from "@/features/admin/envios-manager";
import { requirePanelStore } from "@/lib/auth/store-actor";

export const dynamic = "force-dynamic";

export default async function PanelEnviosPage() {
  const { store } = await requirePanelStore();
  const rows = await shippingMethodsRepo.findMany({
    filters: { store_id: store.id },
  });
  return (
    <PageLayout
      title="Métodos de envío"
      description="Opciones de envío de tu tienda con precio y tiempos de entrega. El cliente elige una al comprarte."
    >
      <EnviosManager initialRows={rows} />
    </PageLayout>
  );
}
