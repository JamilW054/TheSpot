import { PageLayout } from "@/components/layout";
import { PaymentsManager } from "@/features/admin/payments-manager";
import { getAdminPaymentRequests } from "@/database/repositories/payments";

export const dynamic = "force-dynamic";

export default async function AdminPagosPage() {
  const rows = await getAdminPaymentRequests();
  return (
    <PageLayout
      title="Gestión de pagos"
      description="Envía enlaces de pago, sigue el estado de cada cobro y notifica a tus clientes."
    >
      <PaymentsManager initialRows={rows} />
    </PageLayout>
  );
}
