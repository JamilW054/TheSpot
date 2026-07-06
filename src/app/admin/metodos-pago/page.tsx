import { AdminPageHeader } from "@/components/admin/ui";
import { getPaymentMethods } from "@/database/repositories/payments";
import { PaymentMethodsManager } from "@/features/admin/payment-methods-manager";

export const dynamic = "force-dynamic";

export default async function AdminMetodosPagoPage() {
  const methods = await getPaymentMethods();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Métodos de pago"
        description="Activa o desactiva cada método del checkout, y edita su nombre y descripción."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Métodos de pago" },
        ]}
      />
      <PaymentMethodsManager methods={methods} />
    </div>
  );
}
