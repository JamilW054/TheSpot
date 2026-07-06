import { PageLayout } from "@/components/layout";
import {
  getCommissionRates,
  getOrderNotificationEmail,
  getStoreConfig,
} from "@/database/repositories/settings";
import { CommissionsForm } from "./CommissionsForm";
import { OrderNotificationForm } from "./OrderNotificationForm";
import { StoreConfigForm } from "./StoreConfigForm";

export default async function AdminConfigPage() {
  const [orderNotificationEmail, commissionRates, storeConfig] =
    await Promise.all([
      getOrderNotificationEmail(),
      getCommissionRates(),
      getStoreConfig(),
    ]);

  return (
    <PageLayout title="Configuración">
      <div className="space-y-6">
        <OrderNotificationForm initialEmail={orderNotificationEmail} />
        <CommissionsForm
          initialAzulPercent={commissionRates.azulPct}
          initialG3deonPercent={commissionRates.g3deonPct}
        />
        <StoreConfigForm initial={storeConfig} />
      </div>
    </PageLayout>
  );
}
