import { PageLayout } from "@/components/layout";
import {
  getCommissionRates,
  getOrderNotificationEmail,
} from "@/database/repositories/settings";
import { CommissionsForm } from "./CommissionsForm";
import { MockConfigForm } from "./MockConfigForm";
import { OrderNotificationForm } from "./OrderNotificationForm";

export default async function AdminConfigPage() {
  const [orderNotificationEmail, commissionRates] = await Promise.all([
    getOrderNotificationEmail(),
    getCommissionRates(),
  ]);

  return (
    <PageLayout title="Configuración">
      <div className="space-y-6">
        <OrderNotificationForm initialEmail={orderNotificationEmail} />
        <CommissionsForm
          initialAzulPercent={commissionRates.azulPct}
          initialG3deonPercent={commissionRates.g3deonPct}
        />
        <MockConfigForm />
      </div>
    </PageLayout>
  );
}
