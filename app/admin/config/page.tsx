import { PageLayout } from "@/components/layout";
import { getOrderNotificationEmail } from "@/lib/db/settings";
import { MockConfigForm } from "./MockConfigForm";
import { OrderNotificationForm } from "./OrderNotificationForm";

export default async function AdminConfigPage() {
  const orderNotificationEmail = await getOrderNotificationEmail();

  return (
    <PageLayout title="Configuración">
      <div className="space-y-6">
        <OrderNotificationForm initialEmail={orderNotificationEmail} />
        <MockConfigForm />
      </div>
    </PageLayout>
  );
}
