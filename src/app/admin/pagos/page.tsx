import {
  getPaymentSettings,
  listBankAccounts,
} from "@/database/repositories/payments";
import { PaymentsAdminClient } from "./PaymentsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPagosPage() {
  const [settings, accounts] = await Promise.all([
    getPaymentSettings(),
    listBankAccounts(),
  ]);
  return <PaymentsAdminClient settings={settings} accounts={accounts} />;
}
