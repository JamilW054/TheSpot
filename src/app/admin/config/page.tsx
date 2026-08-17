import { PageLayout } from "@/components/layout";
import { getOrderNotificationEmail, getStoreConfig } from "@/database/repositories/settings";
import { getStoreWhatsAppNumber } from "@/lib/whatsapp-server";
import { OrderNotificationForm } from "./OrderNotificationForm";
import { StoreConfigForm } from "./StoreConfigForm";
import { WhatsAppNumberForm } from "./WhatsAppNumberForm";

export default async function AdminConfigPage() {
  const [orderNotificationEmail, whatsappNumber, storeConfig] =
    await Promise.all([
      getOrderNotificationEmail(),
      getStoreWhatsAppNumber(),
      getStoreConfig(),
    ]);

  return (
    <PageLayout title="Configuración">
      <div className="space-y-6">
        <OrderNotificationForm initialEmail={orderNotificationEmail} />
        <WhatsAppNumberForm initialNumber={whatsappNumber} />
        <StoreConfigForm initial={storeConfig} />
      </div>
    </PageLayout>
  );
}
