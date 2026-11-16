import Link from "next/link";
import { PageLayout } from "@/components/layout";
import { getBlockedWords } from "@/database/repositories/stores";
import { getOrderNotificationEmail, getStoreConfig } from "@/database/repositories/settings";
import { getStoreWhatsAppNumber } from "@/lib/whatsapp-server";
import { BlockedWordsForm } from "./BlockedWordsForm";
import { OrderNotificationForm } from "./OrderNotificationForm";
import { StoreConfigForm } from "./StoreConfigForm";
import { WhatsAppNumberForm } from "./WhatsAppNumberForm";

export default async function AdminConfigPage() {
  const [orderNotificationEmail, whatsappNumber, storeConfig, blockedWords] =
    await Promise.all([
      getOrderNotificationEmail(),
      getStoreWhatsAppNumber(),
      getStoreConfig(),
      getBlockedWords(),
    ]);

  return (
    <PageLayout
      title="Configuración"
      description="Ajustes de la plataforma. Pagos, envíos y cupones son de cada tienda (tu tienda oficial se configura en /panel)."
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["/admin/tiendas", "Tiendas", "Aprobar, rechazar y suspender"],
            ["/admin/moderacion", "Moderación", "Productos en revisión y denuncias"],
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
        <BlockedWordsForm initial={blockedWords} />
        <StoreConfigForm initial={storeConfig} />
      </div>
    </PageLayout>
  );
}
