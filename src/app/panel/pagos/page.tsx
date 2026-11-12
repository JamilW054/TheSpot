import { PaymentsAdminClient } from "@/app/admin/pagos/PaymentsAdminClient";
import {
  getPaymentSettings,
  listBankAccounts,
} from "@/database/repositories/payments";
import { requirePanelStore } from "@/lib/auth/store-actor";

export const dynamic = "force-dynamic";

export default async function PanelPagosPage() {
  const { store } = await requirePanelStore();
  const [settings, accounts] = await Promise.all([
    getPaymentSettings(store.id),
    listBankAccounts({ storeId: store.id }),
  ]);
  return <PaymentsAdminClient settings={settings} accounts={accounts} />;
}
