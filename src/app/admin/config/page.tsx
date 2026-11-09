import Link from "next/link";
import { PageLayout } from "@/components/layout";
import { getFreeShippingMinCents } from "@/database/repositories/payments";
import { getOrderNotificationEmail, getStoreConfig } from "@/database/repositories/settings";
import { getStoreWhatsAppNumber } from "@/lib/whatsapp-server";
import { FreeShippingForm } from "./FreeShippingForm";
import { OrderNotificationForm } from "./OrderNotificationForm";
import { StoreConfigForm } from "./StoreConfigForm";
import { WhatsAppNumberForm } from "./WhatsAppNumberForm";

export default async function AdminConfigPage() {
  const [orderNotificationEmail, whatsappNumber, storeConfig, freeShippingCents] =
    await Promise.all([
      getOrderNotificationEmail(),
      getStoreWhatsAppNumber(),
      getStoreConfig(),
      getFreeShippingMinCents(),
    ]);

  return (
    <PageLayout
      title="Configuración"
      description="Todo lo que la tienda necesita para operar, sin tocar código."
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["/admin/pagos", "Pagos y cuentas bancarias", "Contra entrega, transferencia, Banreservas, Popular…"],
            ["/admin/envios", "Métodos de envío", "Precios y tiempos de entrega"],
            ["/admin/categorias", "Categorías", "Orden, fotos y «Próximamente»"],
          ].map(([href, title, sub]) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
            </Link>
          ))}
        </div>
        <WhatsAppNumberForm initialNumber={whatsappNumber} />
        <OrderNotificationForm initialEmail={orderNotificationEmail} />
        <FreeShippingForm initialCents={freeShippingCents} />
        <StoreConfigForm initial={storeConfig} />
      </div>
    </PageLayout>
  );
}
