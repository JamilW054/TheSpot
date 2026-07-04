import { PageLayout } from "@/components/layout";
import { EnviosManager } from "@/features/admin/envios-manager";
import { shippingMethodsRepo } from "@/database/repositories/repositories";

export default async function AdminEnviosPage() {
  const rows = await shippingMethodsRepo.findMany();
  return (
    <PageLayout
      title="Métodos de envío"
      description="Opciones de envío con precio y tiempos de entrega."
    >
      <EnviosManager initialRows={rows} />
    </PageLayout>
  );
}
